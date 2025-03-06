package shaders

import (
	"context"
	"fmt"
	"mime/multipart"
	"shadershare/internal/domain"
	"shadershare/internal/e"
	"shadershare/internal/filestore"
	"slices"
	"strings"

	"github.com/google/uuid"
)

type shaderService struct {
	repo      domain.ShaderRepository
	userRepo  domain.UserRepository
	fileStore filestore.FileStore
}

func NewShaderService(repo domain.ShaderRepository, userRepo domain.UserRepository, fileStore filestore.FileStore) domain.ShaderService {
	return &shaderService{repo, userRepo, fileStore}
}

func (s shaderService) DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) error {
	deletedShader, err := s.repo.DeleteShader(ctx, userID, shaderID)
	if err != nil {
		return err
	}
	// delete preview image
	if deletedShader.PreviewImgURL != "" {
		lastSlash := strings.LastIndex(deletedShader.PreviewImgURL, "/")
		filename := deletedShader.PreviewImgURL[lastSlash+1:]
		err = s.fileStore.RemoveFile(ctx, filename)
	}
	return err
}

func (s shaderService) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload, file *multipart.FileHeader) (*domain.Shader, error) {
	// update if exists already
	var newUrl string
	if updatePayload.PreviewImgURL != nil && file != nil {
		var err error
		newUrl, err = s.fileStore.UpdateFile(file, *updatePayload.PreviewImgURL)
		if err != nil {
			return nil, err
		}
		updatePayload.PreviewImgURL = &newUrl
	}
	shader, err := s.repo.UpdateShader(ctx, userID, shaderID, updatePayload)
	if err != nil {
		return nil, err
	}

	for _, id := range updatePayload.DeletedInputIds {
		parsed, err := uuid.Parse(id)
		if err != nil {
			continue
		}
		s.repo.DeleteShaderInput(ctx, parsed)
	}
	for _, id := range updatePayload.DeletedOutputIds {
		parsed, err := uuid.Parse(id)
		if err != nil {
			continue
		}
		s.repo.DeleteShaderOutput(ctx, parsed)
	}
	return shader, nil
}

const (
	defaultDetailedShaderLim = 50
	defaultShaderLim         = 100
	maxShaderLim             = 100
	maxDetailedShaderLim     = 50
)

func transformLimit(limit int, detailed bool) int {
	var maxLim int
	var defaultLim int
	if detailed {
		maxLim = maxDetailedShaderLim
		defaultLim = defaultDetailedShaderLim
	} else {
		maxLim = maxShaderLim
		defaultLim = defaultShaderLim
	}
	limit = min(limit, maxLim)
	if limit < 0 {
		limit = defaultLim
	}
	return limit
}

var shaderOrderBys = []string{"created_at", "title", ""}

/*
	*

* TODO: materialzied view
*
*
*CREATE MATERIALIZED VIEW top_tags AS
WITH tokenized_tags AS (

	SELECT unnest(
	    regexp_split_to_array(COALESCE(tags, ''), '\s*,\s*')
	) AS word
	FROM shaders

)
SELECT word, COUNT(*) AS frequency
FROM tokenized_tags
GROUP BY word
ORDER BY frequency DESC
LIMIT 10;
*/
func (s shaderService) GetShaders(ctx context.Context, req domain.ShaderListReq) (*domain.ShaderResponse, error) {
	// t1 := time.Now().UnixMicro()
	// s.repo.GetTopTags(ctx)
	// fmt.Println(time.Now().UnixMicro() - t1)

	if !slices.Contains(shaderOrderBys, req.Sort) {
		return nil, e.ErrInvalidSort
	}

	req.Offset = max(req.Offset, 0)
	if req.Filter.UserID == uuid.Nil {
		req.Limit = transformLimit(req.Limit, req.Detailed)
	}
	count, err := s.repo.GetShaderCount(ctx, req.Filter)
	if err != nil {
		return nil, err
	}
	shaders, err := s.repo.GetShaders(ctx, req)
	if err != nil {
		return nil, err
	}
	if shaders == nil {
		shaders = []domain.Shader{}
	}
	return &domain.ShaderResponse{Total: count, Shaders: shaders}, nil
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload, file *multipart.FileHeader) (uuid.UUID, error) {
	file.Filename = randomFileName(".webp")
	fileUrl, err := s.fileStore.UploadFile(file)
	if err != nil {
		return uuid.Nil, err
	}
	shaderPayload.PreviewImgURL = fileUrl

	id, err := s.repo.CreateShader(ctx, userID, shaderPayload)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (s shaderService) GetShader(ctx context.Context, req domain.ShaderByIdReq) (*domain.Shader, error) {
	return s.repo.GetShader(ctx, req)
}

func (s shaderService) CreateShaderInput(ctx context.Context, input domain.CreateShaderInputPayload) (*domain.ShaderInput, error) {
	return s.repo.CreateShaderInput(ctx, input)
}

func (s shaderService) CreateShaderOutput(ctx context.Context, output domain.CreateShaderOutputPayload) (*domain.ShaderOutput, error) {
	return s.repo.CreateShaderOutput(ctx, output)
}

func (s shaderService) DeleteShaderInput(ctx context.Context, inputID uuid.UUID) error {
	return s.repo.DeleteShaderInput(ctx, inputID)
}

func (s shaderService) DeleteShaderOutput(ctx context.Context, outputID uuid.UUID) error {
	return s.repo.DeleteShaderOutput(ctx, outputID)
}

func (s shaderService) GetShaderCount(ctx context.Context, filter domain.GetShaderFilter) (int64, error) {
	return s.repo.GetShaderCount(ctx, filter)
}

func (s shaderService) DeleteShadersBulk(ctx context.Context, userID uuid.UUID, ids []uuid.UUID) (domain.BulkDeleteResp, error) {
	return s.repo.DeleteShadersBulk(ctx, userID, ids)
}

func (s shaderService) CreateShaderPlaylist(ctx context.Context, userID uuid.UUID, payload *domain.CreatePlaylistPayload) (*domain.Playlist, error) {
	return s.repo.CreateShaderPlaylist(ctx, userID, payload)
}

func (s shaderService) GetPlaylist(ctx context.Context, userID uuid.UUID, id uuid.UUID, includeShaders bool) (*domain.Playlist, error) {
	res, err := s.repo.GetPlaylist(ctx, id, includeShaders)
	if err != nil {
		return nil, err
	}
	fmt.Println(res.UserID, userID, res.AccessLevel)
	if res.UserID != userID && res.AccessLevel != domain.AccessLevelPublic {
		return nil, e.ErrUnauthorized
	}
	return res, nil
}

func (s shaderService) DeletePlaylist(ctx context.Context, userID uuid.UUID, id uuid.UUID) error {
	return s.repo.DeletePlaylist(ctx, userID, id)
}

func (s shaderService) AddShaderToPlaylist(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, playlistID uuid.UUID) error {
	return s.repo.AddShaderToPlaylist(ctx, userID, shaderID, playlistID)
}

func (s shaderService) ListShaderPlaylists(ctx context.Context, req *domain.ListPlaylistReq) ([]domain.Playlist, error) {
	return s.repo.ListShaderPlaylists(ctx, req)
}

func (s shaderService) UpdateShaderPlaylist(ctx context.Context, userID uuid.UUID, payload *domain.UpdatePlaylistPayload) error {
	return s.repo.UpdateShaderPlaylist(ctx, userID, payload)
}

func (s shaderService) AddShaderToPlaylistBulk(ctx context.Context, userID uuid.UUID, playlistID uuid.UUID, ids []uuid.UUID) error {
	return s.repo.AddShaderToPlaylistBulk(ctx, userID, playlistID, ids)
}

func (s shaderService) RemoveShadersFromPlaylist(ctx context.Context, userID uuid.UUID, shaderIDs []uuid.UUID, playlistID uuid.UUID) error {
	return s.repo.RemoveShadersFromPlaylist(ctx, userID, shaderIDs, playlistID)
}
