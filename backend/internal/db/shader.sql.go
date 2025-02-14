// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: shader.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createShader = `-- name: CreateShader :one
INSERT INTO shaders (
    title, description, user_id, preview_img_url, access_level
) VALUES (
    $1, $2, $3, $4, $5
)
ON CONFLICT (title) DO NOTHING
RETURNING id, title, description, user_id, access_level, preview_img_url, created_at, updated_at
`

type CreateShaderParams struct {
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	PreviewImgUrl pgtype.Text
	AccessLevel   int16
}

func (q *Queries) CreateShader(ctx context.Context, arg CreateShaderParams) (Shader, error) {
	row := q.db.QueryRow(ctx, createShader,
		arg.Title,
		arg.Description,
		arg.UserID,
		arg.PreviewImgUrl,
		arg.AccessLevel,
	)
	var i Shader
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.UserID,
		&i.AccessLevel,
		&i.PreviewImgUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteShader = `-- name: DeleteShader :exec
DELETE FROM shaders
WHERE id = $1 AND user_id = $2
`

type DeleteShaderParams struct {
	ID     uuid.UUID
	UserID uuid.UUID
}

func (q *Queries) DeleteShader(ctx context.Context, arg DeleteShaderParams) error {
	_, err := q.db.Exec(ctx, deleteShader, arg.ID, arg.UserID)
	return err
}

const getShader = `-- name: GetShader :one
SELECT id, title, description, user_id, access_level, preview_img_url, created_at, updated_at FROM shaders
WHERE id = $1 LIMIT 1
`

func (q *Queries) GetShader(ctx context.Context, id uuid.UUID) (Shader, error) {
	row := q.db.QueryRow(ctx, getShader, id)
	var i Shader
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.UserID,
		&i.AccessLevel,
		&i.PreviewImgUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserShaderList = `-- name: GetUserShaderList :many
SELECT id, title, description, user_id, access_level, preview_img_url, created_at, updated_at FROM shaders 
WHERE user_id = $1
LIMIT $2 OFFSET $3
`

type GetUserShaderListParams struct {
	UserID uuid.UUID
	Limit  int32
	Offset int32
}

func (q *Queries) GetUserShaderList(ctx context.Context, arg GetUserShaderListParams) ([]Shader, error) {
	rows, err := q.db.Query(ctx, getUserShaderList, arg.UserID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Shader
	for rows.Next() {
		var i Shader
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.UserID,
			&i.AccessLevel,
			&i.PreviewImgUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listShaders = `-- name: ListShaders :many
SELECT id, title, description, user_id, access_level, preview_img_url, created_at, updated_at FROM shaders
WHERE access_level = $3
ORDER BY id LIMIT $1 OFFSET $2
`

type ListShadersParams struct {
	Limit       int32
	Offset      int32
	AccessLevel int16
}

func (q *Queries) ListShaders(ctx context.Context, arg ListShadersParams) ([]Shader, error) {
	rows, err := q.db.Query(ctx, listShaders, arg.Limit, arg.Offset, arg.AccessLevel)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Shader
	for rows.Next() {
		var i Shader
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.UserID,
			&i.AccessLevel,
			&i.PreviewImgUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateShader = `-- name: UpdateShader :one
UPDATE shaders 
SET title = COALESCE(NULLIF($3::TEXT,''), title),
    description = COALESCE($4, description),
    preview_img_url = COALESCE($5, preview_img_url),
    access_level = COALESCE($6, access_level)
WHERE id = $1 AND user_id = $2
RETURNING id, title, description, user_id, access_level, preview_img_url, created_at, updated_at
`

type UpdateShaderParams struct {
	ID            uuid.UUID
	UserID        uuid.UUID
	Column3       string
	Description   pgtype.Text
	PreviewImgUrl pgtype.Text
	AccessLevel   int16
}

func (q *Queries) UpdateShader(ctx context.Context, arg UpdateShaderParams) (Shader, error) {
	row := q.db.QueryRow(ctx, updateShader,
		arg.ID,
		arg.UserID,
		arg.Column3,
		arg.Description,
		arg.PreviewImgUrl,
		arg.AccessLevel,
	)
	var i Shader
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.UserID,
		&i.AccessLevel,
		&i.PreviewImgUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
