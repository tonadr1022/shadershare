package shaders

import (
	"context"
	"encoding/json"
	"fmt"
	"shadershare/internal/db"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type shaderRepository struct {
	queries *db.Queries
	db      *pgxpool.Pool
}

func makeStrFromTags(tags pgtype.Text) []string {
	if !tags.Valid {
		return []string{}
	}
	return strings.Split(tags.String, " ")
}

// https://github.com/golang/go/issues/36616
func mapShaderFields(row interface{}) domain.Shader {
	res := domain.Shader{}
	switch r := row.(type) {
	case db.GetShaderWithUserRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Tags = makeStrFromTags(r.Tags)
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.Flags = r.Flags
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.GetShaderDetailedWithUserRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Tags = makeStrFromTags(r.Tags)
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.Flags = r.Flags
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.GetShaderDetailedRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Tags = makeStrFromTags(r.Tags)
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.Flags = r.Flags
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ShaderDetail:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Tags = makeStrFromTags(r.Tags)
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.Flags = r.Flags
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ShaderDetailsWithUser:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Tags = makeStrFromTags(r.Tags)
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.Flags = r.Flags
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.FullShaderView:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ListShaders4Row:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.Shader:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.DeleteShaderRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.UpdateShaderRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.CreateShaderRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Title = r.Title
		res.Description = r.Description.String
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ListShadersDetailedRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.Title = r.Title
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ListShadersDetailedWithUserRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.Title = r.Title
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ListShadersWithUserRow:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.Title = r.Title
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	case db.ShaderWithUser:
		res.PreviewImgURL = r.PreviewImgUrl.String
		res.ID = r.ID
		res.Tags = makeStrFromTags(r.Tags)
		res.Flags = r.Flags
		res.Title = r.Title
		res.Description = r.Description.String
		res.AccessLevel = domain.AccessLevel(r.AccessLevel)
		res.UserID = r.UserID
		res.CreatedAt = r.CreatedAt.Time
		res.UpdatedAt = r.UpdatedAt.Time
	}
	switch r := row.(type) {
	case db.ListShadersDetailedRow:
		res.ShaderOutput = r.Outputs
	case db.ListShadersDetailedWithUserRow:
		res.ShaderOutput = r.Outputs
	case db.GetShaderDetailedRow:
		res.ShaderOutput = r.Outputs
	case db.ShaderDetail:
		res.ShaderOutput = r.Outputs
	case db.ShaderDetailsWithUser:
		res.ShaderOutput = r.Outputs
	case db.GetShaderDetailedWithUserRow:
		res.ShaderOutput = r.Outputs
	}

	switch r := row.(type) {
	case db.GetShaderDetailedWithUserRow:
		if r.ParentID.Valid {
			res.ParentID = r.ParentID.Bytes
		}
		if r.ParentTitle.Valid {
			res.ParentTitle = r.ParentTitle.String
		}

	case db.GetShaderDetailedRow:
		if r.ParentID.Valid {
			res.ParentID = r.ParentID.Bytes
		}
		if r.ParentTitle.Valid {
			res.ParentTitle = r.ParentTitle.String
		}
	}

	switch r := row.(type) {
	case db.GetShaderWithUserRow:
		res.Username = r.Username
	case db.ListShadersDetailedWithUserRow:
		res.Username = r.Username
	case db.ListShadersWithUserRow:
		res.Username = r.Username
	case db.ShaderDetailsWithUser:
		res.Username = r.Username
	case db.ShaderWithUser:
		res.Username = r.Username
	case db.GetShaderDetailedWithUserRow:
		res.Username = r.Username
	}
	return res
}

func (r shaderRepository) DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) (*domain.Shader, error) {
	shader, err := r.queries.DeleteShader(ctx, db.DeleteShaderParams{ID: shaderID, UserID: userID})
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}
	apiShader := mapShaderFields(shader)
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
		Flags:    shaderOutputPayload.Flags,
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

func makeTagStr(tags []string) string {
	res := ""
	for _, tag := range tags {
		res += tag + " "
	}
	return res
}

func makePgText(str string) pgtype.Text {
	return pgtype.Text{Valid: str != "", String: str}
}

func (r shaderRepository) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (uuid.UUID, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return uuid.Nil, err
	}

	defer tx.Rollback(ctx)
	var shader db.CreateShaderRow
	params := db.CreateShaderParams{
		Title:       shaderPayload.Title,
		Description: pgtype.Text{String: shaderPayload.Description, Valid: true},
		Tags:        makePgText(makeTagStr(shaderPayload.Tags)),
		UserID:      userID,
		AccessLevel: int16(shaderPayload.AccessLevel),
	}

	if shaderPayload.ForkedFrom != uuid.Nil {
		params.ForkedFrom = shaderPayload.ForkedFrom
	}

	if shaderPayload.PreviewImgURL != "" {
		params.PreviewImgUrl = pgtype.Text{String: shaderPayload.PreviewImgURL, Valid: true}
	}
	shader, err = r.queries.CreateShader(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return uuid.Nil, e.ErrShaderWithTitleExists
		}
		return uuid.Nil, err
	}

	resultOutputs := make([]domain.ShaderOutput, len(shaderPayload.ShaderOutputs))
	// make shader outputs
	for i, shaderOutput := range shaderPayload.ShaderOutputs {
		shaderOutput.ShaderID = shader.ID
		output, err := r.CreateShaderOutput(ctx, shaderOutput)
		if err != nil {
			return uuid.Nil, err
		}

		// make shader inputs for the output
		output.ShaderInputs = make([]domain.ShaderInput, len(shaderOutput.ShaderInputs))
		for shaderInputIdx, shaderInput := range shaderOutput.ShaderInputs {
			shaderInput.OutputID = output.ID
			shaderInput.ShaderID = output.ShaderID
			input, err := r.CreateShaderInput(ctx, shaderInput)
			if err != nil {
				return uuid.Nil, err
			}
			output.ShaderInputs[shaderInputIdx] = *input

		}
		resultOutputs[i] = *output
	}

	err = tx.Commit(ctx)
	if err != nil {
		return uuid.Nil, err
	}
	return shader.ID, nil
}

func NewShaderRepository(db *pgxpool.Pool, queries *db.Queries) domain.ShaderRepository {
	return &shaderRepository{
		queries: queries,
		db:      db,
	}
}

func toPGUUID(id uuid.UUID) pgtype.UUID {
	if id == uuid.Nil {
		return pgtype.UUID{Valid: false}
	}
	return pgtype.UUID{Bytes: id, Valid: true}
}

func toPGInt2(v *int) pgtype.Int2 {
	if v == nil {
		return pgtype.Int2{Valid: false}
	}
	return pgtype.Int2{Valid: true, Int16: int16(*v)}
}

func accessLevelToPgInt(access domain.AccessLevel) pgtype.Int2 {
	if access == domain.AccessLevelNull {
		return pgtype.Int2{Int16: 1, Valid: false}
	}
	return pgtype.Int2{Valid: true, Int16: int16(access)}
}

func (r shaderRepository) ShaderFromDB(dbShader db.Shader) domain.Shader {
	shader := domain.Shader{
		ID:            dbShader.ID,
		Title:         dbShader.Title,
		Description:   dbShader.Description.String,
		PreviewImgURL: dbShader.PreviewImgUrl.String,
		AccessLevel:   domain.AccessLevel(dbShader.AccessLevel),
		UserID:        dbShader.UserID,
		CreatedAt:     dbShader.CreatedAt.Time,
		UpdatedAt:     dbShader.UpdatedAt.Time,
	}
	return shader
}

func (r shaderRepository) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload) (*domain.Shader, error) {
	params := db.UpdateShaderParams{
		ID:     shaderID,
		UserID: userID,
	}

	if len(updatePayload.Tags) > 0 {
		params.Tags = makePgText(makeTagStr(updatePayload.Tags))
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

	dbShader, err := r.queries.UpdateShader(ctx, params)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
		return nil, err
	}

	outsUpdated := 0
	insUpdated := 0
	shaderOutputID := uuid.Nil
	for _, shaderOutput := range updatePayload.ShaderOutputs {
		if shaderOutput.ID != uuid.Nil {
			shaderOutputID = shaderOutput.ID
			outputUpdateParams := db.UpdateShaderOutputParams{
				ID: shaderOutput.ID,
			}
			if shaderOutput.Code != nil {
				outputUpdateParams.Column2 = *shaderOutput.Code
			}
			if shaderOutput.Name != nil {
				outputUpdateParams.Column3 = *shaderOutput.Name
			}
			if shaderOutput.Type != nil {
				outputUpdateParams.Column4 = *shaderOutput.Type
			}
			if shaderOutput.Flags != nil {
				outputUpdateParams.Column5 = *shaderOutput.Flags
			}
			outsUpdated++
			r.queries.UpdateShaderOutput(ctx, outputUpdateParams)
		} else {
			params := db.CreateShaderOutputParams{
				ShaderID: updatePayload.ID,
				Code:     *shaderOutput.Code,
				Name:     *shaderOutput.Name,
				Type:     *shaderOutput.Type,
				Flags:    *shaderOutput.Flags,
			}

			dbShaderOutput, err := r.queries.CreateShaderOutput(ctx, params)
			if err != nil {
				return nil, err
			}
			shaderOutputID = dbShaderOutput.ID
		}

		for _, shaderInput := range shaderOutput.ShaderInputs {
			if shaderInput.ID != uuid.Nil { // update
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
				insUpdated++
				r.queries.UpdateShaderInput(ctx, params)
			} else { // create
				params := db.CreateShaderInputParams{
					ShaderID: updatePayload.ID,
					OutputID: shaderOutputID,
				}
				if shaderInput.Type != nil {
					params.Type = *shaderInput.Type
				}
				if shaderInput.Idx != nil {
					params.Idx = int32(*shaderInput.Idx)
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

				_, err := r.queries.CreateShaderInput(ctx, params)
				if err != nil {
					return nil, err
				}
			}
		}
		fmt.Println("outs updated: ", outsUpdated, "insupdated: ", insUpdated)

	}

	shader := mapShaderFields(dbShader)
	return &shader, nil
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

func (r shaderRepository) GetShader(ctx context.Context, req domain.ShaderByIdReq) (*domain.Shader, error) {
	var row interface{}
	var err error
	if req.Detailed {
		if req.IncludeUserData {
			row, err = r.queries.GetShaderDetailedWithUser(ctx, req.ID)
		} else {
			row, err = r.queries.GetShaderDetailed(ctx, req.ID)
		}
	} else {
		if req.IncludeUserData {
			row, err = r.queries.GetShaderWithUser(ctx, req.ID)
		} else {
			row, err = r.queries.GetShader(ctx, req.ID)
		}
	}
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, e.ErrNotFound
		}
	}
	shader := mapShaderFields(row)
	return &shader, nil
}

func (r shaderRepository) GetShaderCount(ctx context.Context, filter domain.GetShaderFilter) (int64, error) {
	return r.queries.CountShaders(ctx, db.CountShadersParams{
		UserID:      toPGUUID(filter.UserID),
		AccessLevel: accessLevelToPgInt(filter.AccessLevel),
		Query:       makePgText(filter.Query),
	})
}

func offLimToPgType(val int) pgtype.Int4 {
	if val < 0 {
		return pgtype.Int4{Int32: -1, Valid: false}
	}
	return pgtype.Int4{Valid: true, Int32: int32(val)}
}

func getSortString(sort string, rev bool) string {
	if rev {
		return fmt.Sprintf("%s_desc", sort)
	} else {
		return fmt.Sprintf("%s_asc", sort)
	}
}

func (r shaderRepository) GetShaders(ctx context.Context, req domain.ShaderListReq) ([]domain.Shader, error) {
	var dbShaders interface{}
	var err error
	var orderBy pgtype.Text
	if req.Sort != "" {
		orderBy = pgtype.Text{Valid: true, String: getSortString(req.Sort, req.SortReverse)}
	} else {
		orderBy = pgtype.Text{Valid: false}
	}
	lim := offLimToPgType(req.Limit)
	access := accessLevelToPgInt(req.Filter.AccessLevel)
	off := int32(req.Offset)
	query := makePgText(req.Filter.Query)

	isTagOnly := strings.Contains(req.Filter.Query, "tag=")
	tagonly := pgtype.Bool{Bool: isTagOnly, Valid: isTagOnly}
	if isTagOnly {
		query.String = strings.TrimPrefix(query.String, "tag=")
	}
	if req.Detailed {
		if req.IncludeUserData {
			dbShaders, err = r.queries.ListShadersDetailedWithUser(ctx, db.ListShadersDetailedWithUserParams{
				Lim:            lim,
				SearchTagsOnly: tagonly,
				Off:            offLimToPgType(req.Offset),
				OrderBy:        orderBy,
				Query:          query,
				AccessLevel:    access,
			})
		} else {
			dbShaders, err = r.queries.ListShadersDetailed(ctx, db.ListShadersDetailedParams{
				UserID:         toPGUUID(req.Filter.UserID),
				AccessLevel:    access,
				SearchTagsOnly: tagonly,
				Off:            off,
				Query:          query,
				OrderBy:        orderBy,
				Lim:            lim,
			})
		}
	} else {
		if req.IncludeUserData {
			dbShaders, err = r.queries.ListShadersWithUser(ctx, db.ListShadersWithUserParams{
				Lim:            lim,
				Off:            off,
				SearchTagsOnly: tagonly,
				Query:          query,
				OrderBy:        orderBy,
				AccessLevel:    access,
			})
		} else {
			dbShaders, err = r.queries.ListShaders4(ctx, db.ListShaders4Params{
				Lim:            lim,
				SearchTagsOnly: tagonly,
				Off:            off,
				Query:          query,
				OrderBy:        orderBy,
				AccessLevel:    access,
			})
		}
	}
	if err != nil {
		return nil, err
	}
	switch v := dbShaders.(type) {
	case []db.Shader:
		return processShaders(v)
	case []db.ShaderDetail:
		return processShaders(v)
	case []db.ShaderDetailsWithUser:
		return processShaders(v)
	case []db.ShaderWithUser:
		return processShaders(v)
	case []db.ListShadersDetailedRow:
		return processShaders(v)
	case []db.ListShadersDetailedWithUserRow:
		return processShaders(v)
	case []db.ListShadersWithUserRow:
		return processShaders(v)
	case []db.ListShaders4Row:
		return processShaders(v)
	default:
		return nil, fmt.Errorf("unexpected type: %T", dbShaders)
	}
}

func processShaders[T any](shaders []T) ([]domain.Shader, error) {
	result := make([]domain.Shader, len(shaders))
	for i, shader := range shaders {
		result[i] = mapShaderFields(shader)
	}
	return result, nil
}

func (r shaderRepository) GetTopTags(ctx context.Context) ([]string, error) {
	dbRes, err := r.queries.GetTopTags(ctx)
	if err != nil {
		return nil, err
	}
	res := []string{}
	for _, r := range dbRes {
		if s, ok := r.Word.(string); ok {
			res = append(res, s)
		}
	}
	return res, nil
}

func (r shaderRepository) DeleteShadersBulk(ctx context.Context, userID uuid.UUID, ids []uuid.UUID) (domain.BulkDeleteResp, error) {
	res := r.queries.DeleteShadersBulk(ctx, ids)
	tot := 0
	res.Exec(func(val int, err error) {
		if err != nil {
		} else {
			tot++
		}
	})
	err := res.Close()
	result := domain.BulkDeleteResp{DeletedCount: 0}
	if err != nil {
		return result, err
	}
	result.DeletedCount = tot
	return result, nil
}
