// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: batch.go

package db

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var (
	ErrBatchAlreadyClosed = errors.New("batch already closed")
)

const deleteShadersBulk = `-- name: DeleteShadersBulk :batchexec
DELETE FROM shaders 
WHERE id = $1::uuid
`

type DeleteShadersBulkBatchResults struct {
	br     pgx.BatchResults
	tot    int
	closed bool
}

func (q *Queries) DeleteShadersBulk(ctx context.Context, id []uuid.UUID) *DeleteShadersBulkBatchResults {
	batch := &pgx.Batch{}
	for _, a := range id {
		vals := []interface{}{
			a,
		}
		batch.Queue(deleteShadersBulk, vals...)
	}
	br := q.db.SendBatch(ctx, batch)
	return &DeleteShadersBulkBatchResults{br, len(id), false}
}

func (b *DeleteShadersBulkBatchResults) Exec(f func(int, error)) {
	defer b.br.Close()
	for t := 0; t < b.tot; t++ {
		if b.closed {
			if f != nil {
				f(t, ErrBatchAlreadyClosed)
			}
			continue
		}
		_, err := b.br.Exec()
		if f != nil {
			f(t, err)
		}
	}
}

func (b *DeleteShadersBulkBatchResults) Close() error {
	b.closed = true
	return b.br.Close()
}
