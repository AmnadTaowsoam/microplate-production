// services/data-service/src/models/index.ts

export interface PredictionRun {
    id: number;
    sample_no: string;
    description?: string;
    predict_at: string;
    annotated_image_path: string;
    model_version?: string;
    status: 'pending' | 'running' | 'success' | 'error';
    error_msg?: string;
  }
  
  export interface RowCount {
    id: number;
    run_id: number;
    counts: Record<string, any>;
    created_at: string;
  }
  
  export interface InterfaceResult {
    id: number;
    run_id: number;
    results: any[];
    created_at: string;
  }
  
  export interface WellPrediction {
    id: number;
    run_id: number;
    label: string;
    class: string;
    confidence: number;
    bbox: { x1: number; y1: number; x2: number; y2: number };
    created_at: string;
  }
  
  export interface ImageFile {
    id: number;
    run_id: number;
    sample_no: string;
    file_type: 'raw' | 'annotated';
    path: string;
    created_at: string;
  }

  export interface SampleSummary {
    sample_no: string;           // primary key for the summary table
    summary: any;                // JSONB aggregation payload, e.g. { "distribution": {...} }
  }
  