
-- name: CreateShaderInput :one 
INSERT INTO shader_inputs (
    shader_id, output_id, url, type, idx, properties
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING *;

-- name: GetShaderInput :one
SELECT * FROM shader_inputs
WHERE id = $1;

-- name: ListShaderInputs :many
SELECT * FROM shader_inputs
WHERE shader_id = $1;

-- name: UpdateShaderInput :one
UPDATE shader_inputs
SET url = COALESCE(NULLIF($2::TEXT,''), url),
    type = COALESCE(NULLIF($3::TEXT,''), type),
    idx = COALESCE($4, idx),
    properties = COALESCE($5, properties)
WHERE id = $1 RETURNING *;

-- name: DeleteShaderInput :exec
DELETE FROM shader_inputs
WHERE id = $1;



-- name: CreateShaderOutput :one
INSERT INTO shader_outputs (
    shader_id, code, name, type
) VALUES (
    $1, $2, $3, $4
) RETURNING *;

-- name: DeleteShaderOutput :exec
DELETE FROM shader_outputs
WHERE id = $1;

-- name: GetShaderOutput :one
SELECT * FROM shader_outputs
WHERE id = $1;

-- name: ListShaderOutputs :many
SELECT * FROM shader_outputs
WHERE shader_id = $1;

-- name: UpdateShaderOutput :one
UPDATE shader_outputs
SET code = COALESCE(NULLIF($2::TEXT,''), code),
    name = COALESCE(NULLIF($3::TEXT,''), name),
    type = COALESCE(NULLIF($4::TEXT,''), type)
WHERE id = $1 RETURNING *;

-- name: GetShaderCount :one
SELECT COUNT(*) FROM shaders;

-- name: GetShaderDetailed :one
SELECT *
FROM 
  shader_details s
WHERE 
  s.id = $1;

-- name: GetShaderDetailedList :many
SELECT 
  s.*
FROM shader_details s
WHERE s.access_level = $3
ORDER BY s.updated_at DESC
LIMIT $1 OFFSET $2;

-- name: GetShaderDetailedWithUser :one
SELECT 
  sd.*, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id
WHERE sd.id = $1;

-- name: GetShaderDetailedWithUserList :many
SELECT 
  sd.*, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id
WHERE sd.access_level = $3
ORDER BY sd.updated_at DESC
LIMIT $1 OFFSET $2;


-- name: GetShadersWithUser :many 
SELECT s.*, u.username 
FROM shaders s 
JOIN users u ON s.user_id = u.id 
WHERE s.access_level = $3
ORDER BY s.updated_at DESC
LIMIT $1 OFFSET $2;


