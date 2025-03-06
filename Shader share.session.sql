EXPLAIN ANALYZE
SELECT id,
    title,
    description,
    user_id,
    access_level,
    preview_img_url,
    created_at,
    updated_at,
    flags,
    tags
FROM shaders
WHERE (
        user_id = NULL
        OR NULL IS NULL
    )
    AND (
        access_level = 0
        OR 0 IS NULL
    )
    AND (
        '' IS NULL
        OR '' = ''
        OR (
            -- Search in title and tags combined
            (
                false IS NULL
                OR false = false
            )
            AND textsearchable_index_col @@ plainto_tsquery('english', "")
            OR -- Search only in tags
            (
                true IS NOT NULL
                AND true = true
            )
            AND tags @@ plainto_tsquery('english', $3::text)
        )
    )
ORDER BY CASE
        WHEN 'created_at_asc' = 'created_at_asc' THEN created_at
    END ASC,
    CASE
        WHEN 'created_at_desc' = 'created_at_desc' THEN created_at
    END DESC
LIMIT 10 OFFSET 10