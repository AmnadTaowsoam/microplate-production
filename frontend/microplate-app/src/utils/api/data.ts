// src/utils/api/data.ts
import { fetcher } from '../../utils/fetcher';

/**
 * Common response types
 */
export interface SuccessResponse {
  success: boolean;
}
export interface CreateIdResponse {
  id: string;
  success: boolean;
}
export interface ListResponse<T> {
  items: T[];
}

/**
 * Raw Predict Entity
 */
export interface RawPredict {
  id: string;
  plateId: string;
  rawPredict: any;
}

/**
 * Image Entity
 */
export interface ImageRecord {
  id: string;
  plateId: string;
  imageUrl: string;
}

/**
 * Results Entity
 */
export interface ResultRecord {
  id: string;
  plateId: string;
  results: any[];
}

/**
 * Interface Results Entity
 */
export interface InterfaceResultRecord {
  id: string;
  sampleNo: string;
  interfaceResult: any;
}

/**
 * Data Service API
 */
export const dataApi = {
  // 1. Raw Predict Endpoints
  createRawPredict: (plateId: string, rawPredict: any) =>
    fetcher<CreateIdResponse>('/data/raw-predict', {
      method: 'POST',
      body: JSON.stringify({ plateId, rawPredict }),
    }),
  listRawPredict: () =>
    fetcher<ListResponse<RawPredict>>('/data/raw-predict'),
  getRawPredict: (id: string) =>
    fetcher<RawPredict>(`/data/raw-predict/${id}`),
  updateRawPredict: (id: string, rawPredict: any) =>
    fetcher<SuccessResponse>(`/data/raw-predict/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ rawPredict }),
    }),
  deleteRawPredict: (id: string) =>
    fetcher<SuccessResponse>(`/data/raw-predict/${id}`, {
      method: 'DELETE',
    }),

  // 2. Images Endpoints
  createImage: (plateId: string, imageBase64: string) =>
    fetcher<CreateIdResponse>('/data/images', {
      method: 'POST',
      body: JSON.stringify({ plateId, imageBase64 }),
    }),
  getImage: (id: string) =>
    fetcher<ImageRecord>(`/data/images/${id}`),

  // 3. Results Endpoints
  createResults: (plateId: string, results: any[]) =>
    fetcher<CreateIdResponse>('/data/results', {
      method: 'POST',
      body: JSON.stringify({ plateId, results }),
    }),
  listResults: () =>
    fetcher<ListResponse<ResultRecord>>('/data/results'),
  getResults: (id: string) =>
    fetcher<ResultRecord>(`/data/results/${id}`),
  updateResults: (id: string, results: any[]) =>
    fetcher<SuccessResponse>(`/data/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ results }),
    }),
  deleteResults: (id: string) =>
    fetcher<SuccessResponse>(`/data/results/${id}`, {
      method: 'DELETE',
    }),

  // 4. Interface Results Endpoints
  createInterfaceResults: (sampleNo: string, interfaceResult: any) =>
    fetcher<CreateIdResponse>('/data/interface-results', {
      method: 'POST',
      body: JSON.stringify({ sampleNo, interfaceResult }),
    }),
  listInterfaceResults: () =>
    fetcher<ListResponse<InterfaceResultRecord>>('/data/interface-results'),
  getInterfaceResult: (id: string) =>
    fetcher<InterfaceResultRecord>(`/data/interface-results/${id}`),
  updateInterfaceResult: (id: string, interfaceResult: any) =>
    fetcher<SuccessResponse>(`/data/interface-results/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ interfaceResult }),
    }),
  deleteInterfaceResult: (id: string) =>
    fetcher<SuccessResponse>(`/data/interface-results/${id}`, {
      method: 'DELETE',
    }),

  // 5. Sample Summary Endpoints
  getSampleSummary: () =>
    fetcher<any>('/data/sample-summary'),
  getSampleSummaryBySample: (sampleNo: string) =>
    fetcher<any>(`/data/sample-summary/by-sample/${sampleNo}`),
};

