-- name: GetShader :one
SELECT * FROM shaders
WHERE id = $1 LIMIT 1;

-- name: ListShaders :many
SELECT * FROM shaders
WHERE access_level = $3
ORDER BY id LIMIT $1 OFFSET $2;

-- name: CreateShader :one
INSERT INTO shaders (
    title, description, user_id, preview_img_url, access_level
) VALUES (
    $1, $2, $3, $4, $5
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
    description = COALESCE($4, description),
    preview_img_url = COALESCE($5, preview_img_url),
    access_level = COALESCE($6, access_level)
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteShader :one
DELETE FROM shaders
WHERE id = $1 AND user_id = $2 RETURNING *;
