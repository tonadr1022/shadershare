-- name: GetShader :one
SELECT * FROM shaders
WHERE id = $1 LIMIT 1;

-- name: ListShaders :many
SELECT * FROM shaders
ORDER BY id LIMIT $1 OFFSET $2;

-- name: CreateShader :one
INSERT INTO shaders (
    description, user_id
) VALUES (
    $1, $2
) RETURNING *;
