-- name: GetShader :one
SELECT * FROM shaders
WHERE id = $1 LIMIT 1;

-- name: ListShaders :many
SELECT * FROM shaders
ORDER BY id LIMIT $1 OFFSET $2;

-- name: CreateShader :one
INSERT INTO shaders (
    title, description, user_id, preview_img_url
) VALUES (
    $1, $2, $3, $4
)
ON CONFLICT (title) DO NOTHING
RETURNING *;

-- name: GetUserShaderList :many 
SELECT * FROM shaders 
WHERE user_id = $1
LIMIT $2 OFFSET $3;

-- name: UpdateShader :one
UPDATE shaders 
SET title = COALESCE(NULLIF($3::TEXT,''), title),
    description = COALESCE($4, description)
WHERE id = $1 AND user_id = $2
RETURNING *;
