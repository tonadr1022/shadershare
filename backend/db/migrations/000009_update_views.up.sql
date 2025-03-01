DROP VIEW IF EXISTS shader_details_with_user;
DROP VIEW IF EXISTS shader_with_user;
DROP VIEW IF EXISTS shader_details;

CREATE VIEW shader_details AS
WITH aggregated_inputs AS (
    SELECT si.output_id,
        JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
                'id',
                si.id,
                'shader_id',
                si.shader_id,
                'output_id',
                si.output_id,
                'url',
                si.url,
                'type',
                si.type,
                'idx',
                si.idx,
                'properties',
                si.properties
            )
        ) FILTER (
            WHERE si.id IS NOT NULL
        ) AS shader_inputs
    FROM shader_inputs si
    GROUP BY si.output_id
)
SELECT s.id, s.title, s.description, s.user_id, 
    s.access_level, s.preview_img_url, s.created_at, 
    s.updated_at, s.flags, s.tags, 
    JSON_AGG(
        DISTINCT JSONB_BUILD_OBJECT(
            'id',
            so.id,
            'shader_id',
            so.shader_id,
            'code',
            so.code,
            'name',
            so.name,
            'type',
            so.type,
            'flags',
            so.flags,
            'shader_inputs',
            ai.shader_inputs
        )
    ) FILTER (
        WHERE so.id IS NOT NULL
    ) AS outputs

FROM shaders s
    LEFT JOIN shader_outputs so ON so.shader_id = s.id
    LEFT JOIN aggregated_inputs ai ON ai.output_id = so.id
GROUP BY s.id;

CREATE VIEW shader_details_with_user AS 
SELECT sd.id, sd.title, sd.description, sd.user_id, 
    sd.access_level, sd.preview_img_url, sd.created_at, 
    sd.updated_at, sd.flags, sd.tags, sd.outputs,
    u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id;

CREATE VIEW shader_with_user AS 
SELECT s.id, s.title, s.description, s.user_id, 
    s.access_level, s.preview_img_url, s.created_at, 
    s.updated_at, s.flags, s.tags, 
    u.username
FROM shaders s
JOIN users u ON s.user_id = u.id;

DROP VIEW IF EXISTS full_shader_view;
CREATE VIEW full_shader_view AS 
SELECT id, title, description, user_id, 
    access_level, preview_img_url, created_at, 
    updated_at, flags, tags
FROM shaders;
