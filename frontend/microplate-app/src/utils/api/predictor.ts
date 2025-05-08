// src/utils/api/predictor.ts
import { fetcher } from '../../utils/fetcher';

export interface PredictRequest {
  imageUrl: string;
  plateId: string;
}
export interface PredictResult {
  well: string;
  value: number;
}

// Define the response interface matching backend's JSON
export interface PredictResponse {
  run_id: number;
  counts: Record<string, number[]>;
  last_positions: Record<string, number>;
  distribution: Record<string, number>;
  annotated_image: string;
}

export const predictorApi = {
  predict: (file: File, sample_no: string) => {
    const formData = new FormData();
    formData.append('sample_no', sample_no);
    formData.append('file', file);
    // Now fetcher returns the raw PredictResponse
    return fetcher<PredictResponse>('/predictor/predict', {
      method: 'POST',
      body: formData,
    });
  },
};
