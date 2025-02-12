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

-- name: UpdateRenderPass :one
UPDATE render_passes
SET code = COALESCE(NULLIF($2::TEXT,''), code),
    name = COALESCE(NULLIF($3::TEXT,''), name)
WHERE id = $1 RETURNING *;

-- name: GetRenderPassesByShaderIDs :many
SELECT * FROM render_passes WHERE shader_id = ANY ($1);
