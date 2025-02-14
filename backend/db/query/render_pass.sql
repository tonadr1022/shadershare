
-- name: CreateShaderInput :one 
INSERT INTO shader_inputs (
    shader_id, url, type, idx, name
) VALUES (
    $1, $2, $3, $4, $5
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
    idx = COALESCE(NULLIF($4::SMALLINT,''), idx),
    name = COALESCE(NULLIF($5::TEXT,''), name)
WHERE id = $1 RETURNING *;

-- name: DeleteShaderInput :exec
DELETE FROM shader_inputs
WHERE id = $1;



-- name: CreateShaderOutput :one
INSERT INTO shader_outputs (
    shader_id, code, name, type, idx
) VALUES (
    $1, $2, $3, $4, $5
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
    type = COALESCE(NULLIF($4::TEXT,''), type),
    idx = COALESCE(NULLIF($5::SMALLINT,''), idx)
WHERE id = $1 RETURNING *;

-- name: GetShaderDetailed :one
SELECT 
  s.*,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', si.id, 
        'shader_id', si.shader_id,
        'url', si.url,
        'type', si.type, 
        'idx', si.idx,
        'name', si.name
        )) FROM shader_inputs si WHERE si.shader_id = s.id) AS inputs,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', so.id,
        'shader_id', so.shader_id,
        'code', so.code,
        'name', so.name,
        'type', so.type,
        'idx', so.idx
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
        'idx', si.idx,
        'name', si.name
        )) FROM shader_inputs si WHERE si.shader_id = s.id) AS inputs,
  (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'id', so.id,
        'shader_id', so.shader_id,
        'code', so.code,
        'name', so.name,
        'type', so.type,
        'idx', so.idx
        )) FROM shader_outputs so WHERE so.shader_id = s.id) AS outputs
FROM shaders s
WHERE s.access_level = $3
LIMIT $1 OFFSET $2;
