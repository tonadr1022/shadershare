-- CREATE VIEW shader_details AS
-- SELECT 
--   s.*,
--   (SELECT JSON_AGG(JSON_BUILD_OBJECT(
--         'id', si.id, 
--         'shader_id', si.shader_id,
--         'url', si.url,
--         'type', si.type, 
--         'name', si.name,
--         'idx', si.idx,
--         'properties', si.properties
--     )) FROM shader_inputs si WHERE si.shader_id = s.id) AS inputs,
--   (SELECT JSON_AGG(JSON_BUILD_OBJECT(
--         'id', so.id,
--         'shader_id', so.shader_id,
--         'code', so.code,
--         'name', so.name,
--         'type', so.type
--     )) FROM shader_outputs so WHERE so.shader_id = s.id) AS outputs
-- FROM shaders s;
--
