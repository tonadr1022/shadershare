CREATE TABLE shader_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    access_level SMALLINT DEFAULT 0 NOT NULL, -- 0: private, 1: public, 2: unlisted
    description TEXT,
    user_id UUID NOT NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shader_playlist_junction (
    playlist_id UUID NOT NULL,
    shader_id UUID NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (playlist_id, shader_id),
    FOREIGN KEY (playlist_id) REFERENCES shader_playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (shader_id) REFERENCES shaders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER trigger_update_shader_playlist_timestamp
BEFORE UPDATE ON shader_playlists
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
