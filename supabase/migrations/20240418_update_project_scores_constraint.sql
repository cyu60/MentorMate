-- Drop any existing constraints that might conflict
ALTER TABLE project_scores
DROP CONSTRAINT IF EXISTS project_scores_project_id_judge_id_key,
DROP CONSTRAINT IF EXISTS project_scores_project_id_judge_id_track_id_key;

-- Add the new composite unique constraint
ALTER TABLE project_scores
ADD CONSTRAINT project_scores_project_id_judge_id_track_id_key 
UNIQUE (project_id, judge_id, track_id); 