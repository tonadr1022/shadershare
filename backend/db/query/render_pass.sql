
-- name: CreateShaderInput :one 
INSERT INTO shader_inputs (
    shader_id, url, type, name, idx, properties
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
    name = COALESCE(NULLIF($4::TEXT,''), name),
    idx = COALESCE($5, idx),
    properties = COALESCE($6, properties)
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

-- name: GetShaderDetailedList22 :many
SELECT 
    s.*,
    JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
        'id', si.id, 
        'shader_id', si.shader_id,
        'url', si.url,
        'type', si.type, 
        'name', si.name,
        'idx', si.idx,
        'properties', si.properties
    )) FILTER (WHERE si.id IS NOT NULL) AS inputs,
    JSON_AGG(DISTINCT JSONB_BUILD_OBJECT(
        'id', so.id,
        'shader_id', so.shader_id,
        'code', so.code,
        'name', so.name,
        'type', so.type
    )) FILTER (WHERE so.id IS NOT NULL) AS outputs
FROM shaders s
LEFT JOIN shader_inputs si ON si.shader_id = s.id
LEFT JOIN shader_outputs so ON so.shader_id = s.id
WHERE s.access_level = $3
GROUP BY s.id
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
