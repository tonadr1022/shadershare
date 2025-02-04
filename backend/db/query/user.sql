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
    username, email, password
) VALUES (
    $1, $2, $3
) RETURNING *;

-- name: UpdateUser :exec
UPDATE users 
SET 
username = coalesce(sqlc.narg('username'),username),
email = coalesce(sqlc.narg('email'),email),
password = coalesce(sqlc.narg('password'),password)
WHERE id = sqlc.narg('id')
RETURNING *;


-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;
