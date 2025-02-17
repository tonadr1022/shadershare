package shaders

import (
	"context"
	"encoding/json"
	"fmt"
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

func (r shaderRepository) DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) error {
	err := r.queries.DeleteShader(ctx, db.DeleteShaderParams{ID: shaderID, UserID: userID})
	if err != nil {
		if err == pgx.ErrNoRows {
			return e.ErrNotFound
		}
		return err
	}
	return nil
}

func (r shaderRepository) CreateShaderInput(ctx context.Context, shaderInput domain.CreateShaderInputPayload) (*domain.ShaderInput, error) {
	params := db.CreateShaderInputParams{
		ShaderID: shaderInput.ShaderID,
		Type:     shaderInput.Type,
		Idx:      int16(shaderInput.Idx),
		Name:     shaderInput.Name,
	}

	if shaderInput.Url != nil {
		params.Url = pgtype.Text{String: *shaderInput.Url, Valid: true}
	}

	if shaderInput.Properties != nil {
		jsonB, err := json.Marshal(*shaderInput.Properties)
		if err != nil {
			return nil, err
		}
		params.Properties = jsonB
	}

	dbShaderInput, err := r.queries.CreateShaderInput(ctx, params)
	if err != nil {
		return nil, err
	}
	result := r.shaderInputFromDB(dbShaderInput)
	return &result, nil
}

func (r shaderRepository) CreateShaderOutput(ctx context.Context, shaderOutputPayload domain.CreateShaderOutputPayload) (*domain.ShaderOutput, error) {
	params := db.CreateShaderOutputParams{
		ShaderID: shaderOutputPayload.ShaderID,
		Code:     shaderOutputPayload.Code,
		Name:     shaderOutputPayload.Name,
		Type:     shaderOutputPayload.Type,
		Idx:      int16(shaderOutputPayload.Idx),
	}
	dbShaderOutput, err := r.queries.CreateShaderOutput(ctx, params)
	if err != nil {
		return nil, err
	}
	result := r.shaderOutputFromDB(dbShaderOutput)
	return &result, nil
}

// TODO: user verification?
func (r shaderRepository) DeleteShaderOutput(ctx context.Context, shaderOutputID uuid.UUID) error {
	err := r.queries.DeleteShaderOutput(ctx, shaderOutputID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return e.ErrNotFound
		}
	}
	return nil
}

func (r shaderRepository) DeleteShaderInput(ctx context.Context, shaderInputID uuid.UUID) error {
	err := r.queries.DeleteShaderInput(ctx, shaderInputID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return e.ErrNotFound
		}
		return err
	}
	return nil
}

func (r shaderRepository) shaderInputFromDB(dbShaderInput db.ShaderInput) domain.ShaderInput {
	// TODO: invalid strings?
	return domain.ShaderInput{
		ID:   dbShaderInput.ID,
		Idx:  int(dbShaderInput.Idx),
		Name: dbShaderInput.Name,
		Type: dbShaderInput.Type,
		Url:  dbShaderInput.Url.String,
	}
}

func (r shaderRepository) shaderOutputFromDB(dbShaderOutput db.ShaderOutput) domain.ShaderOutput {
	return domain.ShaderOutput{
		ID:   dbShaderOutput.ID,
		Idx:  int(dbShaderOutput.Idx),
		Name: dbShaderOutput.Name,
		Type: dbShaderOutput.Type,
		Code: dbShaderOutput.Code,
	}
}

func (r shaderRepository) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderDetailed, error) {
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
		AccessLevel: int16(shaderPayload.AccessLevel),
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
	// make shader inputs
	resultInputs := make([]domain.ShaderInput, len(shaderPayload.ShaderInputs))
	for _, shaderInput := range shaderPayload.ShaderInputs {
		props, err := json.Marshal(shaderInput.Properties)
		if err != nil {
			return nil, err
		}
		params := db.CreateShaderInputParams{
			ShaderID:   shader.ID,
			Type:       shaderInput.Type,
			Idx:        int16(shaderInput.Idx),
			Name:       shaderInput.Name,
			Properties: props,
		}
		if shaderInput.Url != nil {
			params.Url = pgtype.Text{String: *shaderInput.Url, Valid: true}
		}

		input, err := r.queries.CreateShaderInput(ctx, params)
		if err != nil {
			return nil, err
		}
		resultInputs = append(resultInputs, r.shaderInputFromDB(input))
	}
	resultOutputs := make([]domain.ShaderOutput, len(shaderPayload.ShaderOutputs))
	// make shader outputs
	for _, shaderOutput := range shaderPayload.ShaderOutputs {
		params := db.CreateShaderOutputParams{
			ShaderID: shader.ID,
			Code:     shaderOutput.Code,
			Name:     shaderOutput.Name,
			Type:     shaderOutput.Type,
			Idx:      int16(shaderOutput.Idx),
		}
		output, err := r.queries.CreateShaderOutput(ctx, params)
		if err != nil {
			return nil, err
		}
		resultOutputs = append(resultOutputs, r.shaderOutputFromDB(output))
	}
	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	shaderWithRenderPasses := &domain.ShaderDetailed{Shader: r.ShaderFromDB(shader), ShaderOutputs: resultOutputs, ShaderInputs: resultInputs}
	return shaderWithRenderPasses, nil
}

func NewShaderRepository(db *pgxpool.Pool, queries *db.Queries) domain.ShaderRepository {
	return &shaderRepository{
		queries: queries,
		db:      db,
	}
}

func (r shaderRepository) GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.ShaderDetailed, error) {
	detailedShaders, err := r.queries.GetShaderDetailedList(ctx, db.GetShaderDetailedListParams{Limit: int32(limit), Offset: int32(offset), AccessLevel: int16(accessLevel)})
	if err != nil {
		return nil, err
	}
	result := make([]domain.ShaderDetailed, len(detailedShaders))
	for i, dbShader := range detailedShaders {
		shader, err := r.convertGetShaderDetailedListRow(&dbShader)
		if err != nil {
			return nil, err
		}
		result[i] = *shader
	}
	return result, nil
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
	for _, shaderInput := range updatePayload.ShaderInputs {
		params := db.UpdateShaderInputParams{
			ID: shaderInput.ID,
		}
		if shaderInput.Properties != nil {
			jsonB, err := json.Marshal(*shaderInput.Properties)
			if err != nil {
				return nil, err
			}
			params.Properties = jsonB
		}

		if shaderInput.Url != nil {
			params.Column2 = *shaderInput.Url
		}
		if shaderInput.Type != nil {
			params.Column3 = *shaderInput.Type
		}
		if shaderInput.Idx != nil {
			params.Idx = int16(*shaderInput.Idx)
		}
		if shaderInput.Name != nil {
			params.Column5 = *shaderInput.Name
		}
		r.queries.UpdateShaderInput(ctx, params)
	}

	for _, shaderOutput := range updatePayload.ShaderOutputs {
		params := db.UpdateShaderOutputParams{
			ID: shaderOutput.ID,
		}
		if shaderOutput.Code != nil {
			params.Column2 = *shaderOutput.Code
		}
		if shaderOutput.Name != nil {
			params.Column3 = *shaderOutput.Name
		}
		if shaderOutput.Type != nil {
			params.Column4 = *shaderOutput.Type
		}
		if shaderOutput.Idx != nil {
			params.Idx = int16(*shaderOutput.Idx)
		}
		r.queries.UpdateShaderOutput(ctx, params)
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

func (r shaderRepository) convertGetShaderDetailedListRow(row *db.GetShaderDetailedListRow) (*domain.ShaderDetailed, error) {
	shaderDetailed := &domain.ShaderDetailed{
		Shader: domain.Shader{
			ID:            row.ID,
			Title:         row.Title,
			Description:   row.Description.String,
			UserID:        row.UserID,
			AccessLevel:   domain.AccessLevel(row.AccessLevel),
			PreviewImgURL: row.PreviewImgUrl.String,
			CreatedAt:     row.CreatedAt.Time,
			UpdatedAt:     row.UpdatedAt.Time,
		},
		ShaderInputs:  []domain.ShaderInput{},
		ShaderOutputs: []domain.ShaderOutput{},
	}

	if len(row.Inputs) > 0 {
		if err := json.Unmarshal(row.Inputs, &shaderDetailed.ShaderInputs); err != nil {
			return shaderDetailed, fmt.Errorf("failed to decode inputs: %w", err)
		}
	}

	if len(row.Outputs) > 0 {
		if err := json.Unmarshal(row.Outputs, &shaderDetailed.ShaderOutputs); err != nil {
			return shaderDetailed, fmt.Errorf("failed to decode outputs: %w", err)
		}
	}

	return shaderDetailed, nil
}

func (r shaderRepository) convertGetShaderDetailedRow(row *db.GetShaderDetailedRow) (*domain.ShaderDetailed, error) {
	shaderDetailed := &domain.ShaderDetailed{
		Shader: domain.Shader{
			ID:            row.ID,
			Title:         row.Title,
			Description:   row.Description.String,
			UserID:        row.UserID,
			AccessLevel:   domain.AccessLevel(row.AccessLevel),
			PreviewImgURL: row.PreviewImgUrl.String,
			CreatedAt:     row.CreatedAt.Time,
			UpdatedAt:     row.UpdatedAt.Time,
		},
		ShaderInputs:  []domain.ShaderInput{},
		ShaderOutputs: []domain.ShaderOutput{},
	}

	if len(row.Inputs) > 0 {
		if err := json.Unmarshal(row.Inputs, &shaderDetailed.ShaderInputs); err != nil {
			return shaderDetailed, fmt.Errorf("failed to decode inputs: %w", err)
		}
	}

	if len(row.Outputs) > 0 {
		if err := json.Unmarshal(row.Outputs, &shaderDetailed.ShaderOutputs); err != nil {
			return shaderDetailed, fmt.Errorf("failed to decode outputs: %w", err)
		}
	}

	return shaderDetailed, nil
}

func (r shaderRepository) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderDetailed, error) {
	shaderDetailed, err := r.queries.GetShaderDetailed(ctx, shaderID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
	}
	converted, err := r.convertGetShaderDetailedRow(&shaderDetailed)
	if err != nil {
		return nil, err
	}
	return converted, nil
}

func (r shaderRepository) GetShaderCount(ctx context.Context) (int64, error) {
	return r.queries.GetShaderCount(ctx)
}
