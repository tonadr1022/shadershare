-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserByEmailOrUsername :one 
SELECT * FROM users
WHERE email = $1 OR username = $1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY id;

-- name: CreateUser :one
INSERT INTO users (
    username, email, avatar_url
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: UpdateUser :one
UPDATE users 
SET 
username = coalesce(NULLIF($2::TEXT,''),username),
email = coalesce(NULLIF($3::TEXT,''),email),
avatar_url = coalesce(NULLIF($4::TEXT,''),avatar_url)
WHERE id = $1
RETURNING *;


-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: GetUsernames :many 
SELECT username FROM users
WHERE id = ANY($1);
