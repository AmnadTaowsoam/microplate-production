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

export const predictorApi = {
  predict: (data: PredictRequest) =>
    fetcher<{ results: PredictResult[] }>('/predictor/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
