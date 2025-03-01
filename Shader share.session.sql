SELECT *
FROM shaders
WHERE textsearchable_index_col @@ plainto_tsquery('english', 'EnchantedEtherea');