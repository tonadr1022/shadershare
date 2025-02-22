// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: render_pass.sql

package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const createShaderInput = `-- name: CreateShaderInput :one
INSERT INTO shader_inputs (
    shader_id, output_id,url, type, idx, properties
) VALUES (
    $1, $2, $3, $4, $5, $6
) RETURNING id, shader_id, output_id, url, type, idx, properties
`

type CreateShaderInputParams struct {
	ShaderID   uuid.UUID
	OutputID   uuid.UUID
	Url        pgtype.Text
	Type       string
	Idx        int32
	Properties []byte
}

func (q *Queries) CreateShaderInput(ctx context.Context, arg CreateShaderInputParams) (ShaderInput, error) {
	row := q.db.QueryRow(ctx, createShaderInput,
		arg.ShaderID,
		arg.OutputID,
		arg.Url,
		arg.Type,
		arg.Idx,
		arg.Properties,
	)
	var i ShaderInput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.OutputID,
		&i.Url,
		&i.Type,
		&i.Idx,
		&i.Properties,
	)
	return i, err
}

const createShaderOutput = `-- name: CreateShaderOutput :one
INSERT INTO shader_outputs (
    shader_id, code, name, type
) VALUES (
    $1, $2, $3, $4
) RETURNING id, shader_id, code, name, type
`

type CreateShaderOutputParams struct {
	ShaderID uuid.UUID
	Code     string
	Name     string
	Type     string
}

func (q *Queries) CreateShaderOutput(ctx context.Context, arg CreateShaderOutputParams) (ShaderOutput, error) {
	row := q.db.QueryRow(ctx, createShaderOutput,
		arg.ShaderID,
		arg.Code,
		arg.Name,
		arg.Type,
	)
	var i ShaderOutput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.Code,
		&i.Name,
		&i.Type,
	)
	return i, err
}

const deleteShaderInput = `-- name: DeleteShaderInput :exec
DELETE FROM shader_inputs
WHERE id = $1
`

func (q *Queries) DeleteShaderInput(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteShaderInput, id)
	return err
}

const deleteShaderOutput = `-- name: DeleteShaderOutput :exec
DELETE FROM shader_outputs
WHERE id = $1
`

func (q *Queries) DeleteShaderOutput(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.Exec(ctx, deleteShaderOutput, id)
	return err
}

const getShaderCount = `-- name: GetShaderCount :one
SELECT COUNT(*) FROM shaders
`

func (q *Queries) GetShaderCount(ctx context.Context) (int64, error) {
	row := q.db.QueryRow(ctx, getShaderCount)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const getShaderDetailed = `-- name: GetShaderDetailed :one
SELECT id, title, description, user_id, access_level, preview_img_url, created_at, updated_at, outputs
FROM 
  shader_details s
WHERE 
  s.id = $1
`

func (q *Queries) GetShaderDetailed(ctx context.Context, id uuid.UUID) (ShaderDetail, error) {
	row := q.db.QueryRow(ctx, getShaderDetailed, id)
	var i ShaderDetail
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.UserID,
		&i.AccessLevel,
		&i.PreviewImgUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Outputs,
	)
	return i, err
}

const getShaderDetailedList = `-- name: GetShaderDetailedList :many
SELECT 
  s.id, s.title, s.description, s.user_id, s.access_level, s.preview_img_url, s.created_at, s.updated_at, s.outputs
FROM shader_details s
WHERE s.access_level = $3
ORDER BY s.updated_at DESC
LIMIT $1 OFFSET $2
`

type GetShaderDetailedListParams struct {
	Limit       int32
	Offset      int32
	AccessLevel int16
}

func (q *Queries) GetShaderDetailedList(ctx context.Context, arg GetShaderDetailedListParams) ([]ShaderDetail, error) {
	rows, err := q.db.Query(ctx, getShaderDetailedList, arg.Limit, arg.Offset, arg.AccessLevel)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ShaderDetail
	for rows.Next() {
		var i ShaderDetail
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.UserID,
			&i.AccessLevel,
			&i.PreviewImgUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Outputs,
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

const getShaderDetailedWithUser = `-- name: GetShaderDetailedWithUser :one
SELECT 
  sd.id, sd.title, sd.description, sd.user_id, sd.access_level, sd.preview_img_url, sd.created_at, sd.updated_at, sd.outputs, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id
WHERE sd.id = $1
`

type GetShaderDetailedWithUserRow struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
	Outputs       []byte
	Username      string
}

func (q *Queries) GetShaderDetailedWithUser(ctx context.Context, id uuid.UUID) (GetShaderDetailedWithUserRow, error) {
	row := q.db.QueryRow(ctx, getShaderDetailedWithUser, id)
	var i GetShaderDetailedWithUserRow
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.UserID,
		&i.AccessLevel,
		&i.PreviewImgUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Outputs,
		&i.Username,
	)
	return i, err
}

const getShaderDetailedWithUserList = `-- name: GetShaderDetailedWithUserList :many
SELECT 
  sd.id, sd.title, sd.description, sd.user_id, sd.access_level, sd.preview_img_url, sd.created_at, sd.updated_at, sd.outputs, 
  u.username
FROM shader_details sd
JOIN users u ON sd.user_id = u.id
WHERE sd.access_level = $3
ORDER BY sd.updated_at DESC
LIMIT $1 OFFSET $2
`

type GetShaderDetailedWithUserListParams struct {
	Limit       int32
	Offset      int32
	AccessLevel int16
}

type GetShaderDetailedWithUserListRow struct {
	ID            uuid.UUID
	Title         string
	Description   pgtype.Text
	UserID        uuid.UUID
	AccessLevel   int16
	PreviewImgUrl pgtype.Text
	CreatedAt     pgtype.Timestamptz
	UpdatedAt     pgtype.Timestamptz
	Outputs       []byte
	Username      string
}

func (q *Queries) GetShaderDetailedWithUserList(ctx context.Context, arg GetShaderDetailedWithUserListParams) ([]GetShaderDetailedWithUserListRow, error) {
	rows, err := q.db.Query(ctx, getShaderDetailedWithUserList, arg.Limit, arg.Offset, arg.AccessLevel)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetShaderDetailedWithUserListRow
	for rows.Next() {
		var i GetShaderDetailedWithUserListRow
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.UserID,
			&i.AccessLevel,
			&i.PreviewImgUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Outputs,
			&i.Username,
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

const getShaderInput = `-- name: GetShaderInput :one
SELECT id, shader_id, output_id, url, type, idx, properties FROM shader_inputs
WHERE id = $1
`

func (q *Queries) GetShaderInput(ctx context.Context, id uuid.UUID) (ShaderInput, error) {
	row := q.db.QueryRow(ctx, getShaderInput, id)
	var i ShaderInput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.OutputID,
		&i.Url,
		&i.Type,
		&i.Idx,
		&i.Properties,
	)
	return i, err
}

const getShaderOutput = `-- name: GetShaderOutput :one
SELECT id, shader_id, code, name, type FROM shader_outputs
WHERE id = $1
`

func (q *Queries) GetShaderOutput(ctx context.Context, id uuid.UUID) (ShaderOutput, error) {
	row := q.db.QueryRow(ctx, getShaderOutput, id)
	var i ShaderOutput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.Code,
		&i.Name,
		&i.Type,
	)
	return i, err
}

const listShaderInputs = `-- name: ListShaderInputs :many
SELECT id, shader_id, output_id, url, type, idx, properties FROM shader_inputs
WHERE shader_id = $1
`

func (q *Queries) ListShaderInputs(ctx context.Context, shaderID uuid.UUID) ([]ShaderInput, error) {
	rows, err := q.db.Query(ctx, listShaderInputs, shaderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ShaderInput
	for rows.Next() {
		var i ShaderInput
		if err := rows.Scan(
			&i.ID,
			&i.ShaderID,
			&i.OutputID,
			&i.Url,
			&i.Type,
			&i.Idx,
			&i.Properties,
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

const listShaderOutputs = `-- name: ListShaderOutputs :many
SELECT id, shader_id, code, name, type FROM shader_outputs
WHERE shader_id = $1
`

func (q *Queries) ListShaderOutputs(ctx context.Context, shaderID uuid.UUID) ([]ShaderOutput, error) {
	rows, err := q.db.Query(ctx, listShaderOutputs, shaderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []ShaderOutput
	for rows.Next() {
		var i ShaderOutput
		if err := rows.Scan(
			&i.ID,
			&i.ShaderID,
			&i.Code,
			&i.Name,
			&i.Type,
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

const updateShaderInput = `-- name: UpdateShaderInput :one
UPDATE shader_inputs
SET url = COALESCE(NULLIF($2::TEXT,''), url),
    type = COALESCE(NULLIF($3::TEXT,''), type),
    idx = COALESCE($4, idx),
    properties = COALESCE($5, properties)
WHERE id = $1 RETURNING id, shader_id, output_id, url, type, idx, properties
`

type UpdateShaderInputParams struct {
	ID         uuid.UUID
	Column2    string
	Column3    string
	Idx        int32
	Properties []byte
}

func (q *Queries) UpdateShaderInput(ctx context.Context, arg UpdateShaderInputParams) (ShaderInput, error) {
	row := q.db.QueryRow(ctx, updateShaderInput,
		arg.ID,
		arg.Column2,
		arg.Column3,
		arg.Idx,
		arg.Properties,
	)
	var i ShaderInput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.OutputID,
		&i.Url,
		&i.Type,
		&i.Idx,
		&i.Properties,
	)
	return i, err
}

const updateShaderOutput = `-- name: UpdateShaderOutput :one
UPDATE shader_outputs
SET code = COALESCE(NULLIF($2::TEXT,''), code),
    name = COALESCE(NULLIF($3::TEXT,''), name),
    type = COALESCE(NULLIF($4::TEXT,''), type)
WHERE id = $1 RETURNING id, shader_id, code, name, type
`

type UpdateShaderOutputParams struct {
	ID      uuid.UUID
	Column2 string
	Column3 string
	Column4 string
}

func (q *Queries) UpdateShaderOutput(ctx context.Context, arg UpdateShaderOutputParams) (ShaderOutput, error) {
	row := q.db.QueryRow(ctx, updateShaderOutput,
		arg.ID,
		arg.Column2,
		arg.Column3,
		arg.Column4,
	)
	var i ShaderOutput
	err := row.Scan(
		&i.ID,
		&i.ShaderID,
		&i.Code,
		&i.Name,
		&i.Type,
	)
	return i, err
}
