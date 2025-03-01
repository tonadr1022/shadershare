CREATE INDEX IF NOT EXISTS idx_shaders_title_prefix ON shaders (LOWER(title) text_pattern_ops);
DROP INDEX shader_search_idx;
