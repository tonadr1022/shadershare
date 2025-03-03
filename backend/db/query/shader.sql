-- name: GetShader :one
SELECT id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags
FROM full_shader_view
WHERE id = $1 LIMIT 1;

-- -- name: ListShaders :many
-- SELECT * FROM shaders
-- WHERE access_level = $3
-- ORDER BY id LIMIT $1 OFFSET $2;

-- name: ListShaders4 :many
SELECT id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags
FROM shaders
WHERE 
  (user_id = sqlc.narg(user_id) OR sqlc.narg(user_id) IS NULL) AND
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL) AND 
  (
    sqlc.narg(query)::text IS NULL OR sqlc.narg(query)::text = '' OR
    (
      -- Search in title and tags combined
      (sqlc.narg(search_tags_only)::boolean IS NULL OR sqlc.narg(search_tags_only)::boolean = false)
      AND textsearchable_index_col @@ plainto_tsquery('english', sqlc.narg(query)::text)
      OR
      -- Search only in tags
      (sqlc.narg(search_tags_only)::boolean IS NOT NULL AND sqlc.narg(search_tags_only)::boolean = true)
      AND tags @@ plainto_tsquery('english', sqlc.narg(query)::text)
    )
  )
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersWithUser :many
SELECT s.id, s.title, s.description, s.user_id, 
    s.access_level, s.preview_img_url, s.created_at, 
    s.updated_at, s.flags, s.tags, s.username
FROM shader_with_user s
WHERE 
  (s.access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL) AND
  (
    sqlc.narg(query)::text IS NULL OR sqlc.narg(query)::text = '' OR
    (
      -- Search in title and tags combined
      (sqlc.narg(search_tags_only)::boolean IS NULL OR sqlc.narg(search_tags_only)::boolean = false)
      AND textsearchable_index_col @@ plainto_tsquery('english', sqlc.narg(query)::text)
      OR
      -- Search only in tags
      (sqlc.narg(search_tags_only)::boolean IS NOT NULL AND sqlc.narg(search_tags_only)::boolean = true)
      AND tags @@ plainto_tsquery('english', sqlc.narg(query)::text)
    )
  )
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN s.created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN s.created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN s.title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN s.title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersDetailed :many
SELECT sd.id, sd.title, sd.description, sd.user_id, 
    sd.access_level, sd.preview_img_url, sd.created_at, 
    sd.updated_at, sd.flags, sd.tags, sd.outputs
FROM shader_details sd
WHERE 
  (user_id = sqlc.narg(user_id) OR sqlc.narg(user_id) IS NULL) AND
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL) AND 
  (
    sqlc.narg(query)::text IS NULL OR sqlc.narg(query)::text = '' OR
    (
      -- Search in title and tags combined
      (sqlc.narg(search_tags_only)::boolean IS NULL OR sqlc.narg(search_tags_only)::boolean = false)
      AND textsearchable_index_col @@ plainto_tsquery('english', sqlc.narg(query)::text)
      OR
      -- Search only in tags
      (sqlc.narg(search_tags_only)::boolean IS NOT NULL AND sqlc.narg(search_tags_only)::boolean = true)
      AND tags @@ plainto_tsquery('english', sqlc.narg(query)::text)
    )
  )
ORDER BY
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_asc' THEN sd.created_at END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'created_at_desc' THEN sd.created_at END DESC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_asc' THEN sd.title END ASC,
    CASE WHEN sqlc.narg(order_by)::text = 'title_desc' THEN sd.title END DESC
LIMIT sqlc.narg(lim)::int
OFFSET @off::int;

-- name: ListShadersDetailedWithUser :many
SELECT sd.id, sd.title, sd.description, sd.user_id, 
    sd.access_level, sd.preview_img_url, sd.created_at, 
    sd.updated_at, sd.flags, sd.tags, sd.outputs,sd.username
FROM shader_details_with_user sd
JOIN users u ON sd.user_id = u.id
WHERE 
  (access_level = sqlc.narg(access_level) OR sqlc.narg(access_level) IS NULL) AND 
  (
    sqlc.narg(query)::text IS NULL OR sqlc.narg(query)::text = '' OR
    (
      -- Search in title and tags combined
      (sqlc.narg(search_tags_only)::boolean IS NULL OR sqlc.narg(search_tags_only)::boolean = false)
      AND textsearchable_index_col @@ plainto_tsquery('english', sqlc.narg(query)::text)
      OR
      -- Search only in tags
      (sqlc.narg(search_tags_only)::boolean IS NOT NULL AND sqlc.narg(search_tags_only)::boolean = true)
      AND tags @@ plainto_tsquery('english', sqlc.narg(query)::text)
    )
  )
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
    (access_level = sqlc.narg('access_level') OR sqlc.narg('access_level') IS NULL) AND
  (
  sqlc.narg(query)::text IS NULL OR sqlc.narg(query)::text = '' OR
  textsearchable_index_col @@ plainto_tsquery(sqlc.narg(query)::text)
  );

-- name: CreateShader :one
INSERT INTO shaders (
    title, description, user_id, preview_img_url, access_level, flags, tags, forked_from
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, sqlc.arg(forked_from)::uuid
)
ON CONFLICT (title) DO NOTHING
RETURNING id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags;


-- name: UpdateShader :one
UPDATE shaders 
SET title = COALESCE(NULLIF($3::TEXT,''), title),
    description = COALESCE($4, description),
    preview_img_url = COALESCE($5, preview_img_url),
    access_level = COALESCE($6, access_level),
    flags = COALESCE($7, flags),
    tags = COALESCE($8, tags)
WHERE id = $1 AND user_id = $2
RETURNING id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags;

-- name: DeleteShader :one
DELETE FROM shaders
WHERE id = $1 AND user_id = $2 RETURNING 
id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags;


-- name: GetShaderWithUser :one 
SELECT s.id, s.title, s.description, s.user_id, 
    s.access_level, s.preview_img_url, s.created_at, 
    s.updated_at, s.flags, s.tags, s.username
FROM shader_with_user s
WHERE s.id = $1;

-- name: GetShaderDetailed :one
SELECT sd.id, sd.title, sd.description, sd.user_id, 
    sd.access_level, sd.preview_img_url, sd.created_at, 
    sd.updated_at, sd.flags, sd.tags, sd.outputs,
    p.id AS parent_id, p.title AS parent_title
FROM shader_details sd 
LEFT JOIN shaders p ON sd.forked_from = p.id 
WHERE sd.id = $1;

-- name: GetShaderDetailedWithUser :one
SELECT sd.id, sd.title, sd.description, sd.user_id, 
    sd.access_level, sd.preview_img_url, sd.created_at, 
    sd.updated_at, sd.flags, sd.tags, sd.outputs,sd.username,
    p.id AS parent_id, p.title AS parent_title
FROM shader_details_with_user sd
LEFT JOIN shaders p ON sd.forked_from = p.id 
WHERE sd.id = $1;


-- name: GetTopTags :many
WITH tokenized_tags AS (
    SELECT unnest(
            regexp_split_to_array(COALESCE(tags, ''), '\s* \s*')
        ) AS word
    FROM shaders
)
SELECT word,
    COUNT(*) AS frequency
FROM tokenized_tags
GROUP BY word
ORDER BY frequency DESC
OFFSET 1 LIMIT 20;


-- name: DeleteShadersBulk :batchexec
DELETE FROM shaders 
WHERE id = sqlc.arg(id)::uuid;
