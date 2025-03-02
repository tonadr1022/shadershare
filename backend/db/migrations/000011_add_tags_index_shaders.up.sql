CREATE INDEX idx_tags_search ON shaders USING gin(to_tsvector('english', tags));
