import os
import cv2
import warnings
import tempfile
from ultralytics import YOLO
from collections import defaultdict
import pandas as pd
import uuid

from app.utils.logger import get_logger
from app.config import Config

from app.services.grid_builder_service import GridBuilder
from app.services.predictor_service import Predictor
from app.services.result_processor_service import ResultProcessor

# ตั้งค่า logging
logger = get_logger(__name__)

warnings.filterwarnings('ignore')
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

class PredictionService:
    """
    ตัวเชื่อมต่อหลัก รัน grid -> predict -> postprocess -> save
    """
    def __init__(self, model_dir=None):
        path = model_dir or getattr(Config, 'MODEL_PATH', None)
        if not path:
            path = os.path.abspath('./app/best_model/best_yolov11x_microplate_final.pt')
        self.grid_builder = GridBuilder()
        self.predictor = Predictor(path)
        self.processor = ResultProcessor()

    def run(self, image_path):
        image_id = uuid.uuid4().hex
        img = cv2.imread(image_path)
        if img is None:
            logger.error(f"Cannot load image {image_path}")
            return None

        # 1. สร้างและวาดกริด
        img_grid, wells = self.grid_builder.draw(img)
        # 2. ทำนายและ annotate
        annotated_img, wells = self.predictor.predict(img_grid, wells)
        # 3. บันทึกรูปผลลัพธ์
        output_file = f"annotated_{image_id}.jpg"
        cv2.imwrite(output_file, annotated_img)
        logger.info(f"Annotated image saved to {output_file}")
        # 4. ประมวลผลผลลัพธ์
        counts = self.processor.count_by_row(wells)
        last_pos = self.processor.last_positions(counts)
        result = self.processor.to_dataframe(last_pos)

        return {"result": result, "wells_info": wells, "annotated_image_path": output_file}