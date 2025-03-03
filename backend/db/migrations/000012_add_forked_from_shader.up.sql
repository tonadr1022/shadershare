ALTER TABLE shaders 
ADD COLUMN forked_from UUID DEFAULT NULL;

ALTER TABLE shaders 
ADD CONSTRAINT fk_forked_from
FOREIGN KEY (forked_from) REFERENCES shaders(id) 
ON DELETE SET NULL;
