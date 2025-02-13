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

CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TABLE IF NOT EXISTS shaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    preview_img_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS render_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shader_id UUID NOT NULL,
    code TEXT NOT NULL,
    pass_index INT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    FOREIGN KEY (shader_id) REFERENCES shaders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_render_passes_shader_id ON render_passes (shader_id);

CREATE TRIGGER trigger_update_shaders_timestamp
BEFORE UPDATE ON shaders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();;
