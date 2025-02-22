DROP VIEW IF EXISTS shader_details;

CREATE VIEW shader_details AS
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
GROUP BY s.id;
