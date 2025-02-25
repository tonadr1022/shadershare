SELECT s.id,
    s.title,
    s.description,
    s.user_id,
    s.access_level,
    s.preview_img_url,
    s.created_at,
    s.updated_at
FROM shaders s
    JOIN users u on u.id = s.user_id
WHERE (
        s.access_level = 1
        OR 1 IS NULL
    )
ORDER BY s.updated_at DESC;