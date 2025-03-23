-- Create project_scores table
CREATE TABLE project_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, judge_id)
);

-- Create indexes
CREATE INDEX idx_project_scores_project_id ON project_scores(project_id);
CREATE INDEX idx_project_scores_judge_id ON project_scores(judge_id);
CREATE INDEX idx_project_scores_scores ON project_scores USING gin (scores);
