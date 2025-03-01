ALTER TABLE shaders 
ADD COLUMN textsearchable_index_col tsvector 
GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || COALESCE(tags, ''))) STORED;
