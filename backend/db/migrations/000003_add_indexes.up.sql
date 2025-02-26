CREATE INDEX IF NOT EXISTS idx_shader_access_level ON shaders (access_level);
CREATE INDEX IF NOT EXISTS idx_shader_created_at ON shaders (created_at);
CREATE INDEX IF NOT EXISTS idx_shader_user_id ON shaders(user_id);
CREATE INDEX IF NOT EXISTS idx_shader_user_access ON shaders (user_id, access_level);
CREATE INDEX IF NOT EXISTS idx_shaders_title_prefix ON shaders (LOWER(title) text_pattern_ops);
