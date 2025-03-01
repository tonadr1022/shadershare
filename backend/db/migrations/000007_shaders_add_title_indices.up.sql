DROP INDEX IF EXISTS idx_shaders_title_prefix;
CREATE INDEX shader_search_idx ON shaders 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(tags,'')))
