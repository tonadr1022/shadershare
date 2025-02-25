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
SELECT s.*,
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
SELECT 
  sd.*, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id;


CREATE VIEW shader_with_user AS 
SELECT s.*, u.username
FROM shaders s
JOIN users u ON s.user_id = u.id;
