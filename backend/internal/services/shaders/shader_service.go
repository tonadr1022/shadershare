package shaders

import (
	"context"
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

func (s shaderService) DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) error {
	return s.repo.DeleteShader(ctx, userID, shaderID)
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

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload) (*domain.ShaderDetailed, error) {
	return s.repo.CreateShader(ctx, userID, shaderPayload)
}

func (s shaderService) GetShader(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderDetailed, error) {
	return s.repo.GetShader(ctx, shaderID)
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

func (s shaderService) GetShadersDetailedWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) (*domain.ShadersDetailedWithUsernames, error) {
	shaders, err := s.repo.GetShadersListDetailed(ctx, sort, limit, offset, accessLevel)
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
	usernamesMap := make(map[uuid.UUID]string)
	for i, username := range usernames {
		usernamesMap[userIDs[i]] = username
	}
	result := &domain.ShadersDetailedWithUsernames{
		Shaders: shaders,
	}
	result.Usernames = make([]string, len(shaders))

	for i, shader := range shaders {
		result.Usernames[i] = usernamesMap[shader.Shader.UserID]
	}
	result.Total, err = s.repo.GetShaderCount(ctx)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (s shaderService) GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.ShaderDetailed, error) {
	return s.repo.GetShadersListDetailed(ctx, sort, limit, offset, accessLevel)
}

func (s shaderService) GetShaderCount(ctx context.Context) (int64, error) {
	return s.repo.GetShaderCount(ctx)
}
