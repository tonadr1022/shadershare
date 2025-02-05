package shaders

import (
	"context"
	"shadershare/internal/domain"

	"github.com/google/uuid"
)

type shaderService struct {
	repo domain.ShaderRepository
}

func NewShaderService(repo domain.ShaderRepository) domain.ShaderService {
	return &shaderService{repo}
}

func (s shaderService) GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]domain.Shader, error) {
	return s.repo.GetUserShaderList(ctx, userID, limit, offset)
}

func (s shaderService) GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]domain.Shader, error) {
	return s.repo.GetShaderList(ctx, sort, limit, offset)
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderWithRenderPasses, error) {
	return s.repo.CreateShader(ctx, userID, shaderPayload)
}
