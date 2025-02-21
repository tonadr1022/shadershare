
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
SELECT 
  s.*,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', si.id, 
        'shader_id', si.shader_id,
        'url', si.url,
        'type', si.type, 
        'name', si.name,
        'idx', si.idx,
        'properties', si.properties
        )) FROM shader_inputs si WHERE si.shader_id = s.id) AS inputs,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', so.id,
        'shader_id', so.shader_id,
        'code', so.code,
        'name', so.name,
        'type', so.type
        )) FROM shader_outputs so WHERE so.shader_id = s.id) AS outputs
FROM 
  shaders s
WHERE 
  s.id = $1;

-- name: GetShaderDetailedList :many
SELECT 
  s.*,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', si.id, 
        'shader_id', si.shader_id,
        'url', si.url,
        'type', si.type, 
        'name', si.name,
        'idx', si.idx,
        'properties', si.properties
        )) FROM shader_inputs si WHERE si.shader_id = s.id) AS inputs,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', so.id,
        'shader_id', so.shader_id,
        'code', so.code,
        'name', so.name,
        'type', so.type
        )) FROM shader_outputs so WHERE so.shader_id = s.id) AS outputs
FROM shaders s
WHERE s.access_level = $3
ORDER BY s.updated_at DESC
LIMIT $1 OFFSET $2;

-- -- name: GetShaderDetailedList2 :many
-- SELECT * FROM shader_details WHERE access_level = $3
-- ORDER BY updated_at DESC
-- LIMIT $1 OFFSET $2;

-- name: GetShaderDetailedWithUser :one
SELECT 
  sd.*, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id
WHERE sd.id = $1;
