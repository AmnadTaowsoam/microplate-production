import os
import cv2
import warnings
import json
from ultralytics import YOLO
from collections import defaultdict
import pandas as pd
import uuid

from app.utils.logger import get_logger
from app.config import Config

# ตั้งค่า logging
logger = get_logger(__name__)

warnings.filterwarnings('ignore')
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

# กำหนดสีสำหรับแต่ละคลาส
colors = {
    0: (255, 0, 0),   # สีแดง
    1: (0, 255, 0),   # สีเขียว
    2: (0, 0, 255),   # สีน้ำเงิน
}

class PredictionProcessor:
    def __init__(self, submission, sample):
        self.submission = submission
        self.sample = sample
        self.image_id_counter = 0  # เริ่มต้นที่ 0 หรือ 1 แล้วแต่กรณี

    def count_by_row(self, wells_info, target_class="Flowing"):
        row_counts = defaultdict(lambda: [0] * 12)
        for well in wells_info:
            if "predictions" in well:
                for pred in well["predictions"]:
                    if pred["class"] == target_class:
                        row_label = well["label"][0]
                        col_num = int(well["label"][1:])
                        row_counts[row_label][col_num - 1] += 1

        final_row_counts = {row: counts[:max(i for i, count in enumerate(counts) if count > 0) + 1]
                            for row, counts in row_counts.items() if any(counts)}

        logger.info(f'Final row counts with submission and sample: {final_row_counts}')
        return final_row_counts

    def grid_adjust(self, image, scale_factor=1.2):
        resized_image, scale_factor = self.resize_image(image, scale_factor)
        rows, cols = 8, 12
        cell_width = int(127 * scale_factor)
        cell_height = int(126 * scale_factor)
        offset_x = int(127 * scale_factor)
        offset_y = int(125 * scale_factor)
        return resized_image, rows, cols, cell_width, cell_height, offset_x, offset_y

    def resize_image(self, image, scale_factor):
        new_width = int(image.shape[1] * scale_factor)
        new_height = int(image.shape[0] * scale_factor)
        resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        return resized_image, scale_factor

    def draw_grid(self, image, rows, cols, cell_width, cell_height, offset_x=0, offset_y=0):
        row_labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        wells_info = []
        for i in range(rows):
            for j in range(cols):
                top_left = (j * cell_width + offset_x, i * cell_height + offset_y)
                bottom_right = ((j + 1) * cell_width + offset_x, (i + 1) * cell_height + offset_y)
                label = f"{row_labels[i]}{j + 1}"
                cv2.rectangle(image, top_left, bottom_right, (0, 0, 255), 2)
                text_position = (top_left[0] + 10, top_left[1] + 30)
                cv2.putText(image, label, text_position, cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 0, 0), 2, cv2.LINE_AA)
                wells_info.append({
                    "label": label,
                    "top_left": top_left,
                    "bottom_right": bottom_right,
                    "predictions": []
                })
        logger.info('Grid drawn successfully with labels and positions.')
        return image, wells_info

    def predict_and_plot(self, image, model, wells_info):
        results = model.predict(source=image, save=False, conf=0.4)
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].cpu().numpy().astype(int).tolist()

                well_label = self.find_well_for_detection(bbox, wells_info)
                if well_label:
                    for well in wells_info:
                        if well["label"] == well_label:
                            well["predictions"].append({
                                "class": class_name,
                                "confidence": confidence,
                                "bbox": bbox
                            })
                            cv2.rectangle(image, (bbox[0], bbox[1]), (bbox[2], bbox[3]), colors[class_id], 2)
                            label = f"{class_name} {confidence:.2f}"
                            cv2.putText(image, label, (bbox[0], bbox[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, colors[class_id], 2)
                            logger.debug(f"Prediction added for well {well_label}: Class={class_name}, Confidence={confidence:.2f}")

    def find_well_for_detection(self, detection_bbox, wells_info):
        x_min, y_min, x_max, y_max = detection_bbox
        for well in wells_info:
            top_left = well['top_left']
            bottom_right = well['bottom_right']
            if (x_min >= top_left[0] and y_min >= top_left[1] and x_max <= bottom_right[0] and y_max <= bottom_right[1]):
                return well['label']
        return None

    def get_last_positions(self, row_counts):
        last_positions = {
            row: max(i for i, count in enumerate(counts) if count > 0) + 1
            for row, counts in row_counts.items() if row not in ["submission", "sample"]
        }
        logger.info(f'Last positions with submission and sample: {last_positions}')
        return last_positions

    def result_after_prediction(self, last_positions):
        columns = list(range(1, 13))
        df = pd.DataFrame(0, index=list("ABCDEFGH"), columns=columns)

        for row, col in last_positions.items():
            if row in "ABCDEFGH":
                df.loc[row, col] = 1

        df.loc['Total'] = df.sum()
        df['total'] = df.sum(axis=1)
        df = df[['total'] + columns]

        total_json = df.loc['Total'].to_dict()
        logger.info(f'Result JSON created: {total_json}')
        return total_json

    def process_image_with_grid_and_prediction(self, image_path, model_dir=None):
        # สร้าง image_id แบบไม่ซ้ำกันด้วย UUID
        image_id = str(uuid.uuid4())
        try:
            # กำหนด path ของ model ให้รองรับทั้ง container และ local development
            if model_dir is None:
                container_path = "/app/best_yolov11x_microplate_final"
                if os.path.exists(container_path):
                    model_dir = container_path  # ใช้ path สำหรับ container
                else:
                    model_dir = os.path.abspath("./app/best_model/best_yolov11x_microplate_final.pt")
            logger.info(f"Initializing DeepSeek with model directory: {model_dir}")
        except Exception as e:
            logger.error(f"Error in determining model directory: {e}")
            return

        model = YOLO(model_dir)
        image = cv2.imread(image_path)
        if image is None:
            logger.error("Cannot load the image. Please check the file path.")
            return

        resized_image, rows, cols, cell_width, cell_height, offset_x, offset_y = self.grid_adjust(image)
        image_with_grid, wells_info = self.draw_grid(resized_image, rows, cols, cell_width, cell_height, offset_x, offset_y)
        self.predict_and_plot(image_with_grid, model, wells_info)

        # ดำเนินการนับตามแถวและสร้างผลลัพธ์
        final_row_counts = self.count_by_row(wells_info, target_class="Flowing")
        last_positions = self.get_last_positions(final_row_counts)
        result_json = self.result_after_prediction(last_positions)

        # ส่งกลับผลลัพธ์ที่รวม bounding box จาก wells_info ด้วย
        response = {
            "result": result_json,
            "wells_info": wells_info  # ข้อมูลนี้มี bounding box และ predictions สำหรับแต่ละ well
        }
        return response
