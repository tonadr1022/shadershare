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

func (s shaderService) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload) (*domain.Shader, error) {
	return s.repo.UpdateShader(ctx, userID, shaderID, updatePayload)
}

func (s shaderService) GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]domain.Shader, error) {
	return s.repo.GetShaderList(ctx, sort, limit, offset)
}

func (s shaderService) GetShadersListWithRenderPasses(ctx context.Context, sort string, limit int, offset int) ([]domain.ShaderWithRenderPasses, error) {
	return s.repo.GetShadersListWithRenderPasses(ctx, sort, limit, offset)
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderWithRenderPasses, error) {
	return s.repo.CreateShader(ctx, userID, shaderPayload)
}

func (s shaderService) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderWithRenderPasses, error) {
	return s.repo.GetShader(ctx, shaderID)
}
