-- ============================================
-- Migration: Alternative Comparisons per Sub-Criteria
-- Run this on the Railway database
-- ============================================

-- Step 1: Clear existing alternative comparison & result data
DELETE FROM ahp_results WHERE type = 'alternative';
DELETE FROM alternative_comparisons;

-- Step 2: Drop old UNIQUE constraint and foreign key on criteria_id in alternative_comparisons
ALTER TABLE alternative_comparisons DROP CONSTRAINT IF EXISTS alternative_comparisons_criteria_id_alternative_row_id_alter_key;
-- also handle any variant of the constraint name
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'alternative_comparisons'
      AND constraint_type IN ('UNIQUE', 'FOREIGN KEY')
  LOOP
    EXECUTE 'ALTER TABLE alternative_comparisons DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;

-- Step 3: Drop criteria_id column from alternative_comparisons, add sub_criteria_id
ALTER TABLE alternative_comparisons DROP COLUMN IF EXISTS criteria_id;
ALTER TABLE alternative_comparisons
  ADD COLUMN sub_criteria_id INTEGER NOT NULL REFERENCES sub_criteria(id) ON DELETE CASCADE;

-- Step 4: Recreate foreign keys for alternative_row_id, alternative_col_id
ALTER TABLE alternative_comparisons
  ADD CONSTRAINT fk_alt_comp_row FOREIGN KEY (alternative_row_id) REFERENCES alternatives(id) ON DELETE CASCADE;
ALTER TABLE alternative_comparisons
  ADD CONSTRAINT fk_alt_comp_col FOREIGN KEY (alternative_col_id) REFERENCES alternatives(id) ON DELETE CASCADE;

-- Step 5: Add UNIQUE constraint on new key
ALTER TABLE alternative_comparisons
  ADD CONSTRAINT uq_alt_comp UNIQUE (sub_criteria_id, alternative_row_id, alternative_col_id);

-- Step 6: Add sub_criteria_id to ahp_results
ALTER TABLE ahp_results ADD COLUMN IF NOT EXISTS sub_criteria_id INTEGER REFERENCES sub_criteria(id) ON DELETE CASCADE;

-- Step 7: Update indexes
DROP INDEX IF EXISTS idx_alt_comp_criteria;
CREATE INDEX idx_alt_comp_sub_criteria ON alternative_comparisons(sub_criteria_id);
CREATE INDEX IF NOT EXISTS idx_alt_comp_row ON alternative_comparisons(alternative_row_id);
CREATE INDEX IF NOT EXISTS idx_alt_comp_col ON alternative_comparisons(alternative_col_id);
CREATE INDEX IF NOT EXISTS idx_ahp_sub_criteria ON ahp_results(sub_criteria_id);

-- Step 8: Add Teknik Elektro as A14 if not exists
INSERT INTO alternatives (name, code, description)
VALUES ('Teknik Elektro', 'A14', 'Program Studi Teknik Elektro')
ON CONFLICT (code) DO NOTHING;
