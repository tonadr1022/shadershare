package shaders

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"
	"shadershare/internal/e"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type shaderRepository struct {
	queries *db.Queries
	db      *pgxpool.Pool
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
	if shaderPayload.PreviewImgURL != "" {
		params.PreviewImgUrl = pgtype.Text{String: shaderPayload.PreviewImgURL, Valid: true}
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
			Name:      renderPass.Name,
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

func NewShaderRepository(db *pgxpool.Pool, queries *db.Queries) domain.ShaderRepository {
	return &shaderRepository{
		queries: queries,
		db:      db,
	}
}

const getRenderPassesByShaderIDsQuery = `-- name: GetRenderPassesByShaderIDs :many
SELECT id, shader_id, code, pass_index, name, created_at FROM render_passes WHERE shader_id = ANY ($1)
`

func getRenderPassesByShaderIDs(conn db.DBTX, ctx context.Context, shaderID []uuid.UUID) ([]db.RenderPass, error) {
	rows, err := conn.Query(ctx, getRenderPassesByShaderIDsQuery, shaderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []db.RenderPass
	for rows.Next() {
		var i db.RenderPass
		if err := rows.Scan(
			&i.ID,
			&i.ShaderID,
			&i.Code,
			&i.PassIndex,
			&i.Name,
			&i.CreatedAt,
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

func (r shaderRepository) GetShadersListWithRenderPasses(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.ShaderWithRenderPasses, error) {
	dbShaders, err := r.queries.ListShaders(ctx, db.ListShadersParams{Limit: int32(limit), Offset: int32(offset), AccessLevel: int16(accessLevel)})
	if err != nil {
		return nil, err
	}

	if len(dbShaders) == 0 {
		return nil, nil
	}

	// Extract shader IDs for batch querying
	shaderIDs := make([]uuid.UUID, len(dbShaders))
	for i, dbShader := range dbShaders {
		shaderIDs[i] = dbShader.ID
	}

	// Fetch all render passes in a single query
	renderPasses, err := getRenderPassesByShaderIDs(r.db, ctx, shaderIDs)
	if err != nil {
		return nil, err
	}

	// Organize render passes by shader ID using a map
	renderPassMap := make(map[uuid.UUID][]domain.RenderPass)
	for _, dbRenderPass := range renderPasses {
		renderPassMap[dbRenderPass.ShaderID] = append(renderPassMap[dbRenderPass.ShaderID], r.RenderPassFromDB(dbRenderPass))
	}

	// Build response
	apiShaders := make([]domain.ShaderWithRenderPasses, len(dbShaders))
	for i, dbShader := range dbShaders {
		shader := r.ShaderFromDB(dbShader)
		apiShaders[i] = domain.ShaderWithRenderPasses{
			Shader:       shader,
			RenderPasses: renderPassMap[dbShader.ID], // Efficient lookup
		}
	}

	return apiShaders, nil
}

func (r shaderRepository) GetShaderList(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.Shader, error) {
	dbShaders, err := r.queries.ListShaders(ctx, db.ListShadersParams{Limit: int32(limit), Offset: int32(offset), AccessLevel: int16(accessLevel)})
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
	shader := domain.Shader{
		ID:          dbShader.ID,
		Title:       dbShader.Title,
		Description: dbShader.Description.String,
		AccessLevel: domain.AccessLevel(dbShader.AccessLevel),
		UserID:      dbShader.UserID,
		CreatedAt:   dbShader.CreatedAt.Time,
		UpdatedAt:   dbShader.UpdatedAt.Time,
	}

	if dbShader.PreviewImgUrl.Valid {
		shader.PreviewImgURL = dbShader.PreviewImgUrl.String
	}
	return shader
}

func (r shaderRepository) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload) (*domain.Shader, error) {
	params := db.UpdateShaderParams{
		ID:     shaderID,
		UserID: userID,
	}

	if updatePayload.PreviewImgURL != nil {
		params.PreviewImgUrl = pgtype.Text{String: *updatePayload.PreviewImgURL, Valid: true}
	}

	if updatePayload.Title != nil {
		params.Column3 = *updatePayload.Title
	}

	if updatePayload.Description != nil {
		params.Description = pgtype.Text{String: *updatePayload.Description, Valid: true}
	}
	if updatePayload.AccessLevel != nil {
		params.AccessLevel = int16(*updatePayload.AccessLevel)
	}

	dbshader, err := r.queries.UpdateShader(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}
	for _, renderPass := range updatePayload.RenderPasses {
		params := db.UpdateRenderPassParams{
			ID: renderPass.ID,
		}
		if renderPass.Code != nil {
			params.Column2 = *renderPass.Code
		}
		if renderPass.Name != nil {
			params.Column3 = *renderPass.Name
		}
		r.queries.UpdateRenderPass(ctx, params)
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

func (r shaderRepository) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderWithRenderPasses, error) {
	dbShader, err := r.queries.GetShader(ctx, shaderID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}
	renderPasses, err := r.queries.GetRenderPassesByShaderID(ctx, shaderID)
	if err != nil {
		return nil, err
	}
	apiRenderPasses := make([]domain.RenderPass, len(renderPasses))
	for i, dbRenderPass := range renderPasses {
		apiRenderPasses[i] = r.RenderPassFromDB(dbRenderPass)
	}
	shader := r.ShaderFromDB(dbShader)
	return &domain.ShaderWithRenderPasses{Shader: shader, RenderPasses: apiRenderPasses}, nil
}
