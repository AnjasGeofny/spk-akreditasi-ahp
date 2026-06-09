-- Run this on an existing database that was created before sub-criteria support.

CREATE TABLE IF NOT EXISTS sub_criteria (
    id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(criteria_id, code)
);

CREATE TABLE IF NOT EXISTS sub_criteria_comparisons (
    id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    sub_criteria_row_id INTEGER NOT NULL REFERENCES sub_criteria(id) ON DELETE CASCADE,
    sub_criteria_col_id INTEGER NOT NULL REFERENCES sub_criteria(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(criteria_id, sub_criteria_row_id, sub_criteria_col_id)
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'ahp_results'
          AND constraint_type = 'CHECK'
          AND constraint_name = 'ahp_results_type_check'
    ) THEN
        ALTER TABLE ahp_results DROP CONSTRAINT ahp_results_type_check;
    END IF;
END $$;

ALTER TABLE ahp_results
ADD CONSTRAINT ahp_results_type_check
CHECK (type IN ('criteria', 'sub_criteria', 'alternative'));

CREATE INDEX IF NOT EXISTS idx_sub_criteria_parent ON sub_criteria(criteria_id);
CREATE INDEX IF NOT EXISTS idx_sub_comp_criteria ON sub_criteria_comparisons(criteria_id);
CREATE INDEX IF NOT EXISTS idx_sub_comp_row ON sub_criteria_comparisons(sub_criteria_row_id);
CREATE INDEX IF NOT EXISTS idx_sub_comp_col ON sub_criteria_comparisons(sub_criteria_col_id);
