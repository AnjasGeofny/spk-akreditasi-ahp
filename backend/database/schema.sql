-- ============================================
-- SPK Akreditasi AHP - Database Schema
-- PostgreSQL
-- ============================================

-- Drop tables if exist (in reverse dependency order)
DROP TABLE IF EXISTS accreditation_results CASCADE;
DROP TABLE IF EXISTS ahp_results CASCADE;
DROP TABLE IF EXISTS assessment_scores CASCADE;
DROP TABLE IF EXISTS alternative_comparisons CASCADE;
DROP TABLE IF EXISTS sub_criteria_comparisons CASCADE;
DROP TABLE IF EXISTS pairwise_comparisons CASCADE;
DROP TABLE IF EXISTS sub_criteria CASCADE;
DROP TABLE IF EXISTS alternatives CASCADE;
DROP TABLE IF EXISTS criteria CASCADE;

-- ============================================
-- 1. Criteria Table
-- ============================================
CREATE TABLE criteria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Sub Criteria Table
-- ============================================
CREATE TABLE sub_criteria (
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

-- ============================================
-- 3. Alternatives Table
-- ============================================
CREATE TABLE alternatives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Pairwise Comparisons (Criteria vs Criteria)
-- ============================================
CREATE TABLE pairwise_comparisons (
    id SERIAL PRIMARY KEY,
    criteria_row_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    criteria_col_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(criteria_row_id, criteria_col_id)
);

-- ============================================
-- 5. Sub Criteria Comparisons (Sub Criteria vs Sub Criteria per Criteria)
-- ============================================
CREATE TABLE sub_criteria_comparisons (
    id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    sub_criteria_row_id INTEGER NOT NULL REFERENCES sub_criteria(id) ON DELETE CASCADE,
    sub_criteria_col_id INTEGER NOT NULL REFERENCES sub_criteria(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(criteria_id, sub_criteria_row_id, sub_criteria_col_id)
);

-- ============================================
-- 6. Alternative Comparisons (Alt vs Alt per Criteria)
-- ============================================
CREATE TABLE alternative_comparisons (
    id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    alternative_row_id INTEGER NOT NULL REFERENCES alternatives(id) ON DELETE CASCADE,
    alternative_col_id INTEGER NOT NULL REFERENCES alternatives(id) ON DELETE CASCADE,
    value DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(criteria_id, alternative_row_id, alternative_col_id)
);

-- ============================================
-- 7. Assessment Scores
-- ============================================
CREATE TABLE assessment_scores (
    id SERIAL PRIMARY KEY,
    criteria_id INTEGER NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    alternative_id INTEGER REFERENCES alternatives(id) ON DELETE CASCADE,
    score DOUBLE PRECISION NOT NULL CHECK (score >= 0 AND score <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. AHP Results
-- ============================================
CREATE TABLE ahp_results (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('criteria', 'sub_criteria', 'alternative')),
    criteria_id INTEGER REFERENCES criteria(id) ON DELETE CASCADE,
    weights JSONB NOT NULL,
    lambda_max DOUBLE PRECISION,
    ci DOUBLE PRECISION,
    cr DOUBLE PRECISION,
    is_consistent BOOLEAN,
    normalized_matrix JSONB,
    comparison_matrix JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. Accreditation Results
-- ============================================
CREATE TABLE accreditation_results (
    id SERIAL PRIMARY KEY,
    alternative_id INTEGER REFERENCES alternatives(id) ON DELETE SET NULL,
    final_score DOUBLE PRECISION NOT NULL,
    readiness_percentage DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    detail_scores JSONB,
    ahp_result_id INTEGER REFERENCES ahp_results(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_pairwise_row ON pairwise_comparisons(criteria_row_id);
CREATE INDEX idx_pairwise_col ON pairwise_comparisons(criteria_col_id);
CREATE INDEX idx_sub_criteria_parent ON sub_criteria(criteria_id);
CREATE INDEX idx_sub_comp_criteria ON sub_criteria_comparisons(criteria_id);
CREATE INDEX idx_sub_comp_row ON sub_criteria_comparisons(sub_criteria_row_id);
CREATE INDEX idx_sub_comp_col ON sub_criteria_comparisons(sub_criteria_col_id);
CREATE INDEX idx_alt_comp_criteria ON alternative_comparisons(criteria_id);
CREATE INDEX idx_alt_comp_row ON alternative_comparisons(alternative_row_id);
CREATE INDEX idx_alt_comp_col ON alternative_comparisons(alternative_col_id);
CREATE INDEX idx_assessment_criteria ON assessment_scores(criteria_id);
CREATE INDEX idx_assessment_alt ON assessment_scores(alternative_id);
CREATE UNIQUE INDEX idx_assessment_scores_unique ON assessment_scores (criteria_id, (COALESCE(alternative_id, 0)));
CREATE INDEX idx_ahp_type ON ahp_results(type);
CREATE INDEX idx_accreditation_alt ON accreditation_results(alternative_id);
