package shaders

import (
	"context"
	"shadershare/internal/db"
	"shadershare/internal/domain"
)

type shaderService struct {
	repo domain.ShaderRepository
	db   *db.Queries
}

func (s shaderService) GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]domain.Shader, error) {
	return s.db.ListShaders(ctx, db.ListShadersParams{Limit: int32(limit), Offset: int32(offset)})
}

func NewShaderService(repo domain.ShaderRepository) domain.ShaderService {
	return &shaderService{repo}
}
