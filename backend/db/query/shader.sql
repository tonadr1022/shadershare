-- name: GetShader :one
SELECT * FROM shaders
WHERE id = $1 LIMIT 1;

-- name: ListShaders :many
SELECT * FROM shaders
WHERE access_level = $3
ORDER BY id LIMIT $1 OFFSET $2;

-- name: GetUserShaderList :many 
SELECT * FROM shaders 
WHERE user_id = $1
LIMIT $2 OFFSET $3;

-- name: ListShaders4 :many
SELECT *
FROM shaders
WHERE 
  (user_id = sqlc.narg(user_id) OR sqlc.narg(user_id) IS NULL) AND
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL)
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersWithUser :many
SELECT s.*
FROM shader_with_user s
WHERE 
  (s.access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL)
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN s.created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN s.created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN s.title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN s.title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersDetailed :many
SELECT sd.*
FROM shader_details sd
WHERE 
  (user_id = sqlc.narg(user_id) OR sqlc.narg(user_id) IS NULL) AND
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL)
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN sd.created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN sd.created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN sd.title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN sd.title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersDetailedWithUser :many
SELECT 
sd.* from shader_details_with_user sd
JOIN users u ON sd.user_id = u.id
WHERE 
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL)
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN sd.created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN sd.created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN sd.title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN sd.title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET sqlc.narg(off)::int;

-- name: CountShaders :one
SELECT COUNT(*)
FROM shaders
WHERE
    (user_id = sqlc.narg('user_id') OR sqlc.narg('user_id') IS NULL) AND
    (access_level = sqlc.narg('access_level') OR sqlc.narg('access_level') IS NULL);

-- name: CreateShader :one
INSERT INTO shaders (
    title, description, user_id, preview_img_url, access_level, flags
) VALUES (
    $1, $2, $3, $4, $5, $6
)
ON CONFLICT (title) DO NOTHING
RETURNING *;


-- name: UpdateShader :one
UPDATE shaders 
SET title = COALESCE(NULLIF($3::TEXT,''), title),
    description = COALESCE($4, description),
    preview_img_url = COALESCE($5, preview_img_url),
    access_level = COALESCE($6, access_level),
    flags = COALESCE($7, flags)
WHERE id = $1 AND user_id = $2
RETURNING *;

-- name: DeleteShader :one
DELETE FROM shaders
WHERE id = $1 AND user_id = $2 RETURNING *;

-- name: GetShaderWithUser :one 
SELECT * FROM shader_with_user s
WHERE s.id = $1;
