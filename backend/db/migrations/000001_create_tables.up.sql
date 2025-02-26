-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL

);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_lower_username ON users (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_lower_email ON users (LOWER(email));

-- triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TABLE IF NOT EXISTS shaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    access_level SMALLINT DEFAULT 0 NOT NULL, -- 0: private, 1: public, 2: unlisted
    preview_img_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shader_access_level ON shaders (access_level);
CREATE INDEX IF NOT EXISTS idx_shader_created_at ON shaders (created_at);
CREATE INDEX IF NOT EXISTS idx_shader_user_id ON shaders(user_id);
CREATE INDEX IF NOT EXISTS idx_shader_user_access ON shaders (user_id, access_level);

CREATE TABLE IF NOT EXISTS shader_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shader_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,

    FOREIGN KEY (shader_id) REFERENCES shaders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shader_outputs_shader_id ON shader_outputs (shader_id);

CREATE TABLE IF NOT EXISTS shader_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shader_id UUID NOT NULL,
    output_id UUID NOT NULL,
    url TEXT,
    type TEXT NOT NULL,
    idx INT NOT NULL,
    properties JSONB,
    FOREIGN KEY (shader_id) REFERENCES shaders(id) ON DELETE CASCADE,
    FOREIGN KEY (output_id) REFERENCES shader_outputs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shader_inputs_shader_id ON shader_inputs (shader_id);
CREATE INDEX IF NOT EXISTS idx_shader_inputs_output_id ON shader_inputs (output_id);

CREATE TRIGGER  IF NOT EXISTS trigger_update_shaders_timestamp
BEFORE UPDATE ON shaders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
