package shaders

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type shaderRepository struct {
	queries *db.Queries
	db      *pgx.Conn
}

// // CreateRenderPass implements domain.ShaderRepository.
// func (r *shaderRepository) CreateRenderPass(ctx context.Context, payload domain.CreateRenderPassPayload) error {
// 	panic("unimplemented")
// }
//
// // CreateShader implements domain.ShaderRepository.
// func (r *shaderRepository) CreateShader(shader domain.Shader) error {
// 	panic("unimplemented")
// }

func (r shaderRepository) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload, renderPasses []domain.RenderPass) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	// make shader
	var shader db.Shader
	shader, err = r.queries.CreateShader(ctx, db.CreateShaderParams{Description: pgtype.Text{String: shaderPayload.Description, Valid: true}, UserID: userID})
	if err != nil {
		return nil, err
	}

	for _, renderPass := range renderPasses {
		_, err := r.queries.CreateRenderPass(ctx, db.CreateRenderPassParams{
			ShaderID:  shader.ID,
			Code:      renderPass.Code,
			PassIndex: int32(renderPass.PassIndex),
		})
		if err != nil {
			return nil, err
		}
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	//    shaderWithRenderPasses
	// make render passes
	panic("unimplemented")
}

func NewShaderRepository(db *pgx.Conn, queries *db.Queries) domain.ShaderRepository {
	return &shaderRepository{
		queries: queries,
		db:      db,
	}
}

func (r shaderRepository) GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]domain.Shader, error) {
	dbShaders, err := r.queries.ListShaders(ctx, db.ListShadersParams{Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return nil, err
	}
	apiShaders := make([]domain.Shader, len(dbShaders))
	for i, dbShader := range dbShaders {
		apiShaders[i] = domain.Shader{
			ID:          dbShader.ID,
			Description: dbShader.Description.String,
			UserID:      dbShader.UserID.String(),
			CreatedAt:   dbShader.CreatedAt.Time,
			UpdatedAt:   dbShader.UpdatedAt.Time,
		}
	}
	return apiShaders, nil
}
