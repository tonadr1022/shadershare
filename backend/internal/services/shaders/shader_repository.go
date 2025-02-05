package shaders

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"
	"shadershare/internal/e"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type shaderRepository struct {
	queries *db.Queries
	db      *pgx.Conn
}

func (r shaderRepository) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderWithRenderPasses, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)
	var shader db.Shader
	params := db.CreateShaderParams{
		Title:       shaderPayload.Title,
		Description: pgtype.Text{String: shaderPayload.Description, Valid: true},
		UserID:      userID,
	}
	shader, err = r.queries.CreateShader(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrShaderWithTitleExists
		}
		return nil, err
	}

	// make render passes for the shader
	outRenderPasses := make([]domain.RenderPass, len(shaderPayload.RenderPasses))
	for i, renderPass := range shaderPayload.RenderPasses {
		rp, err := r.queries.CreateRenderPass(ctx, db.CreateRenderPassParams{
			ShaderID:  shader.ID,
			Code:      renderPass.Code,
			PassIndex: int32(renderPass.PassIndex),
		})
		if err != nil {
			return nil, err
		}
		outRenderPasses[i] = r.RenderPassFromDB(rp)
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	shaderWithRenderPasses := &domain.ShaderWithRenderPasses{Shader: r.ShaderFromDB(shader), RenderPasses: outRenderPasses}
	return shaderWithRenderPasses, nil
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
		apiShaders[i] = r.ShaderFromDB(dbShader)
	}
	return apiShaders, nil
}

func (r shaderRepository) RenderPassFromDB(dbRenderPass db.RenderPass) domain.RenderPass {
	return domain.RenderPass{
		ID:        dbRenderPass.ID,
		ShaderID:  dbRenderPass.ShaderID.String(),
		Code:      dbRenderPass.Code,
		PassIndex: int(dbRenderPass.PassIndex),
	}
}

func (r shaderRepository) ShaderFromDB(dbShader db.Shader) domain.Shader {
	return domain.Shader{
		ID:          dbShader.ID,
		Title:       dbShader.Title,
		Description: dbShader.Description.String,
		UserID:      dbShader.UserID.String(),
		CreatedAt:   dbShader.CreatedAt.Time,
		UpdatedAt:   dbShader.UpdatedAt.Time,
	}
}

func (r shaderRepository) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload) (*domain.Shader, error) {
	params := db.UpdateShaderParams{
		ID:     shaderID,
		UserID: userID,
	}
	if updatePayload.Title != nil {
		params.Column3 = *updatePayload.Title
	}

	if updatePayload.Description != nil {
		params.Description = pgtype.Text{String: *updatePayload.Description, Valid: true}
	}

	dbshader, err := r.queries.UpdateShader(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}

	shader := r.ShaderFromDB(dbshader)
	return &shader, nil
}

func (r shaderRepository) GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]domain.Shader, error) {
	dbShaders, err := r.queries.GetUserShaderList(ctx, db.GetUserShaderListParams{UserID: userID, Limit: int32(limit), Offset: int32(offset)})
	if err != nil {
		return nil, err
	}
	apiShaders := make([]domain.Shader, len(dbShaders))
	for i, dbShader := range dbShaders {
		apiShaders[i] = r.ShaderFromDB(dbShader)
	}
	return apiShaders, nil
}
