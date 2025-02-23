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

func (r shaderRepository) DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) (*domain.Shader, error) {
	shader, err := r.queries.DeleteShader(ctx, db.DeleteShaderParams{ID: shaderID, UserID: userID})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}
	apiShader := r.ShaderFromDB(shader)
	return &apiShader, nil
}

func (r shaderRepository) CreateShaderInput(ctx context.Context, shaderInput domain.CreateShaderInputPayload) (*domain.ShaderInput, error) {
	params := db.CreateShaderInputParams{
		ShaderID: shaderInput.ShaderID,
		OutputID: shaderInput.OutputID,
		Type:     shaderInput.Type,
		Idx:      int32(shaderInput.Idx),
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

	var data map[string]interface{}
	if err := json.Unmarshal(dbShaderInput.Properties, &data); err != nil {
		fmt.Println("err")
	}
	return domain.ShaderInput{
		ID:         dbShaderInput.ID,
		ShaderID:   dbShaderInput.ShaderID,
		Url:        dbShaderInput.Url.String,
		Type:       dbShaderInput.Type,
		Idx:        int(dbShaderInput.Idx),
		Properties: data,
	}
}

func (r shaderRepository) shaderOutputFromDB(dbShaderOutput db.ShaderOutput) domain.ShaderOutput {
	return domain.ShaderOutput{
		ID:       dbShaderOutput.ID,
		ShaderID: dbShaderOutput.ShaderID,
		Code:     dbShaderOutput.Code,
		Name:     dbShaderOutput.Name,
		Type:     dbShaderOutput.Type,
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

	resultOutputs := make([]domain.ShaderOutput, len(shaderPayload.ShaderOutputs))
	// make shader outputs
	for _, shaderOutput := range shaderPayload.ShaderOutputs {
		shaderOutput.ShaderID = shader.ID
		output, err := r.CreateShaderOutput(ctx, shaderOutput)
		if err != nil {
			return nil, err
		}

		// make shader inputs for the output
		output.ShaderInputs = make([]domain.ShaderInput, len(shaderOutput.ShaderInputs))
		for shaderInputIdx, shaderInput := range shaderOutput.ShaderInputs {
			shaderInput.OutputID = output.ID
			shaderInput.ShaderID = output.ShaderID
			input, err := r.CreateShaderInput(ctx, shaderInput)
			if err != nil {
				return nil, err
			}
			output.ShaderInputs[shaderInputIdx] = *input

		}
		resultOutputs = append(resultOutputs, *output)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return nil, err
	}
	shaderWithRenderPasses := &domain.ShaderDetailed{Shader: r.ShaderFromDB(shader), ShaderOutputs: resultOutputs}
	return shaderWithRenderPasses, nil
}

func NewShaderRepository(db *pgxpool.Pool, queries *db.Queries) domain.ShaderRepository {
	return &shaderRepository{
		queries: queries,
		db:      db,
	}
}

func (r shaderRepository) GetShadersDetailedWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) (*domain.ShadersDetailedWithUsernames, error) {
	res, err := r.queries.GetShaderDetailedWithUserList(ctx, db.GetShaderDetailedWithUserListParams{Limit: int32(limit), Offset: int32(offset), AccessLevel: int16(accessLevel)})
	if err != nil {
		return nil, err
	}

	apiShaders := &domain.ShadersDetailedWithUsernames{}
	apiShaders.Shaders = make([]domain.ShaderWithUser, len(res))
	for i, row := range res {
		shaderDetailed := &domain.ShaderWithUser{
			ShaderDetailedResponse: domain.ShaderDetailedResponse{
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
				ShaderOutputs: row.Outputs,
			},
			Username: row.Username,
		}

		apiShaders.Shaders[i] = *shaderDetailed
	}
	return apiShaders, nil
}

func (r shaderRepository) GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.ShaderDetailedResponse, error) {
	detailedShaders, err := r.queries.GetShaderDetailedList(ctx, db.GetShaderDetailedListParams{Limit: int32(limit), Offset: int32(offset), AccessLevel: int16(accessLevel)})
	if err != nil {
		return nil, err
	}
	result := make([]domain.ShaderDetailedResponse, len(detailedShaders))
	for i, row := range detailedShaders {
		res := domain.ShaderDetailedResponse{
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
			ShaderOutputs: row.Outputs,
		}
		result[i] = res
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
	fmt.Println(updatePayload)
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
			params.Idx = int32(*shaderInput.Idx)
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

func (r shaderRepository) unmarshalShaderOutput(data []byte) ([]domain.ShaderOutput, error) {
	if len(data) == 0 {
		return []domain.ShaderOutput{}, nil
	}
	var shaderOutputs []domain.ShaderOutput
	if err := json.Unmarshal(data, &shaderOutputs); err != nil {
		return nil, fmt.Errorf("failed to decode shader outputs: %w", err)
	}
	return shaderOutputs, nil
}

func (r shaderRepository) unmarshalShaderInput(data []byte) ([]domain.ShaderInput, error) {
	if len(data) == 0 {
		return []domain.ShaderInput{}, nil
	}
	var shaderInputs []domain.ShaderInput
	if err := json.Unmarshal(data, &shaderInputs); err != nil {
		return nil, fmt.Errorf("failed to decode shader inputs: %w", err)
	}
	return shaderInputs, nil
}

func (r shaderRepository) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderDetailedResponse, error) {
	row, err := r.queries.GetShaderDetailed(ctx, shaderID)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
	}

	res := &domain.ShaderDetailedResponse{
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
		ShaderOutputs: row.Outputs,
	}
	return res, nil
}

func (r shaderRepository) GetShaderCount(ctx context.Context) (int64, error) {
	return r.queries.GetShaderCount(ctx)
}

func (r shaderRepository) GetShaderWithUser(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderWithUser, error) {
	row, err := r.queries.GetShaderDetailedWithUser(ctx, shaderID)
	if err != nil {
		return nil, db.TransformErrNoRows(err)
	}
	shaderDetailed := &domain.ShaderWithUser{
		ShaderDetailedResponse: domain.ShaderDetailedResponse{
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
			ShaderOutputs: row.Outputs,
		},
		Username: row.Username,
	}
	return shaderDetailed, nil
}
