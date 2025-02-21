package shaders

import (
	"context"
	"log"
	"mime/multipart"
	"shadershare/internal/domain"
	"shadershare/internal/filestore"
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

func (s shaderService) GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]domain.Shader, error) {
	return s.repo.GetUserShaderList(ctx, userID, limit, offset)
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
	return shader, nil
}

func (s shaderService) GetShaderList(ctx context.Context, sort string, limit int, offset int, accessLevel domain.AccessLevel) ([]domain.Shader, error) {
	return s.repo.GetShaderList(ctx, sort, limit, offset, accessLevel)
}

func (s shaderService) CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload domain.CreateShaderPayload, file *multipart.FileHeader) (*domain.ShaderDetailed, error) {
	file.Filename = randomFileName(".png")
	fileUrl, err := s.fileStore.UploadFile(file)
	if err != nil {
		return nil, err
	}
	shaderPayload.PreviewImgURL = fileUrl

	shader, err := s.repo.CreateShader(ctx, userID, shaderPayload)
	if err != nil {
		return nil, err
	}
	return shader, nil
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

func (s shaderService) GetShaderWithUser(ctx context.Context, shaderID uuid.UUID) (*domain.ShaderWithUser, error) {
	return s.repo.GetShaderWithUser(ctx, shaderID)
}
