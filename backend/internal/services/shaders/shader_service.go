package shaders

import (
	"context"
	"fmt"
	"shadershare/internal/domain"

	"github.com/google/uuid"
)

type shaderService struct {
	repo     domain.ShaderRepository
	userRepo domain.UserRepository
}

func NewShaderService(repo domain.ShaderRepository, userRepo domain.UserRepository) domain.ShaderService {
	return &shaderService{repo, userRepo}
}

func (s shaderService) GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]domain.Shader, error) {
	return s.repo.GetUserShaderList(ctx, userID, limit, offset)
}

func (s shaderService) UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload domain.UpdateShaderPayload) (*domain.Shader, error) {
	return s.repo.UpdateShader(ctx, userID, shaderID, updatePayload)
}

func (s shaderService) GetShaderList(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.Shader, error) {
	return s.repo.GetShaderList(ctx, sort, limit, offset, accessLevel)
}

func (s shaderService) GetShadersListWithRenderPasses(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.ShaderWithRenderPasses, error) {
	return s.repo.GetShadersListWithRenderPasses(ctx, sort, limit, offset, accessLevel)
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderWithRenderPasses, error) {
	return s.repo.CreateShader(ctx, userID, shaderPayload)
}

func (s shaderService) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderWithRenderPasses, error) {
	return s.repo.GetShader(ctx, shaderID)
}

func (s shaderService) GetShaderListWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) (*domain.ShadersListWithUsernames, error) {
	shaders, err := s.repo.GetShadersListWithRenderPasses(ctx, sort, limit, offset, accessLevel)
	if err != nil {
		return nil, err
	}
	userIDs := make([]uuid.UUID, len(shaders))
	for i, shader := range shaders {
		userIDs[i] = shader.Shader.UserID
	}
	if shaders == nil {
		return nil, nil
	}
	usernames, err := s.userRepo.GetUsernames(ctx, userIDs)
	if err != nil {
		return nil, err
	}
	fmt.Println("usernames", usernames)
	fmt.Println("userIDs", userIDs)
	usernamesMap := make(map[uuid.UUID]string)
	for i, username := range usernames {
		usernamesMap[userIDs[i]] = username
	}
	result := &domain.ShadersListWithUsernames{
		Shaders: shaders,
	}
	result.Usernames = make([]string, len(shaders))

	for i, shader := range shaders {
		result.Usernames[i] = usernamesMap[shader.Shader.UserID]
	}
	return result, nil
}
