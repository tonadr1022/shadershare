-- name: GetRenderPass :one
SELECT * FROM render_passes
WHERE id = $1;

-- name: ListRenderPasses :many
SELECT * FROM render_passes
ORDER BY id LIMIT $1 OFFSET $2;

-- name: GetRenderPassesByShaderID :many
SELECT * FROM render_passes
WHERE shader_id = $1;

-- name: CreateRenderPass :one
INSERT INTO render_passes (
    shader_id, code, pass_index,name
) VALUES (
    $1, $2, $3, $4
) RETURNING *;
