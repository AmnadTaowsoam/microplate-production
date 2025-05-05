-- สร้าง SCHEMA
CREATE SCHEMA IF NOT EXISTS microplates;

-- 1. Main table to record each prediction run, with additional metadata
CREATE TABLE microplates.prediction_run (
    id                    SERIAL        PRIMARY KEY,
    sample_no             TEXT          NOT NULL,
    description           TEXT          NULL,
    predict_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    annotated_image_path  TEXT          NOT NULL,
    model_version         TEXT          NULL,            -- version or commit SHA ของโมเดล
    status                TEXT          NOT NULL DEFAULT 'pending',  -- pending, running, success, error
    error_msg             TEXT          NULL             -- เก็บข้อความ error หากมี
);

-- 2. Raw predictions JSON
CREATE TABLE microplates.raw_predict (
    id         SERIAL        PRIMARY KEY,
    run_id     INTEGER       NOT NULL REFERENCES microplates.prediction_run(id) ON DELETE CASCADE,
    raw_data   JSONB         NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. Final row counts (as JSONB)
CREATE TABLE microplates.row_counts (
    id         SERIAL        PRIMARY KEY,
    run_id     INTEGER       NOT NULL REFERENCES microplates.prediction_run(id) ON DELETE CASCADE,
    counts     JSONB         NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. Interface results JSON
CREATE TABLE microplates.interface_results (
    id         SERIAL        PRIMARY KEY,
    run_id     INTEGER       NOT NULL REFERENCES microplates.prediction_run(id) ON DELETE CASCADE,
    results    JSONB         NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 5. Detailed well predictions (normalized)
CREATE TABLE microplates.well_prediction (
    id         SERIAL        PRIMARY KEY,
    run_id     INTEGER       NOT NULL REFERENCES microplates.prediction_run(id) ON DELETE CASCADE,
    label      TEXT          NOT NULL,     -- เช่น 'A1'
    class      TEXT          NOT NULL,
    confidence REAL          NOT NULL,
    bbox       JSONB         NOT NULL,     -- {"x1":..,"y1":..,"x2":..,"y2":..}
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 6. Image file metadata (raw vs annotated)
CREATE TABLE microplates.image_file (
    id         SERIAL        PRIMARY KEY,
    run_id     INTEGER       NOT NULL REFERENCES microplates.prediction_run(id) ON DELETE CASCADE,
    sample_no  TEXT          NOT NULL,
    file_type  TEXT          NOT NULL,     -- 'raw' หรือ 'annotated'
    path       TEXT          NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX ON microplates.prediction_run(sample_no);
CREATE INDEX ON microplates.prediction_run(predict_at);

-- GIN indexes for JSONB columns
CREATE INDEX ON microplates.raw_predict        USING GIN (raw_data jsonb_path_ops);
CREATE INDEX ON microplates.row_counts         USING GIN (counts    jsonb_path_ops);
CREATE INDEX ON microplates.interface_results  USING GIN (results   jsonb_path_ops);
