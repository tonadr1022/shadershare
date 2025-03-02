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
ORDER BY frequency DESC OFFSET 1
LIMIT 20;