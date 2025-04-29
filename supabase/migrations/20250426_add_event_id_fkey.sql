ALTER TABLE project_scores
ADD COLUMN event_id UUID;

ALTER TABLE project_scores
ADD CONSTRAINT fk_event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;

CREATE INDEX idx_project_scores_event_id ON project_scores(event_id);