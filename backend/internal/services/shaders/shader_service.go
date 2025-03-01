package shaders

import (
	"context"
	"fmt"
	"log"
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
	shader, err := s.repo.UpdateShader(ctx, userID, shaderID, updatePayload)
	if err != nil {
		return nil, err
	}
	// update if exists already
	if updatePayload.PreviewImgURL != nil && file != nil {
		err = s.fileStore.UpdateFile(file, *updatePayload.PreviewImgURL)
		if err != nil {
			log.Println("Error updating file", err)
			return nil, err
		}
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

func (s shaderService) GetShaders(ctx context.Context, req domain.ShaderListReq) (*domain.ShaderResponse, error) {
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
	fmt.Println(count, "count")
	shaders, err := s.repo.GetShaders(ctx, req)
	if err != nil {
		fmt.Println(err, "err occur")
		return nil, err
	}
	if shaders == nil {
		shaders = []domain.Shader{}
	}
	return &domain.ShaderResponse{Total: count, Shaders: shaders}, nil
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload, file *multipart.FileHeader) (uuid.UUID, error) {
	file.Filename = randomFileName(".png")
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
