package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type (
	Shader struct {
		ID            uuid.UUID   `json:"id"`
		Title         string      `json:"title"`
		Description   string      `json:"description"`
		UserID        uuid.UUID   `json:"user_id"`
		AccessLevel   AccessLevel `json:"access_level"`
		PreviewImgURL string      `json:"preview_img_url"`
		CreatedAt     time.Time   `json:"created_at"`
		UpdatedAt     time.Time   `json:"updated_at"`
	}

	RenderPass struct {
		ID        uuid.UUID `json:"id"`
		ShaderID  string    `json:"shader_id"`
		Code      string    `json:"code"`
		PassIndex int       `json:"pass_index"`
		Name      string    `json:"name"`
	}

	UpdateRenderPassPayload struct {
		ID        uuid.UUID `json:"id" binding:"required"`
		Code      *string   `json:"code,omitempty"`
		PassIndex *int      `json:"pass_index,omitempty"`
		Name      *string   `json:"name,omitempty"`
	}

	UpdateShaderPayload struct {
		ID            uuid.UUID                 `json:"id" binding:"required"`
		UserID        uuid.UUID                 `json:"user_id" binding:"required"`
		Title         *string                   `json:"title,omitempty"`
		Description   *string                   `json:"description,omitempty"`
		PreviewImgURL *string                   `json:"preview_img_url,omitempty"`
		AccessLevel   *AccessLevel              `json:"access_level,omitempty"`
		RenderPasses  []UpdateRenderPassPayload `json:"render_passes,omitempty"`
	}

	CreateRenderPassForShaderPayload struct {
		ShaderID  string `json:"shader_id" binding:"required"`
		Code      string `json:"code" binding:"required"`
		PassIndex int    `json:"pass_index" binding:"required"`
	}

	CreateRenderPassPayload struct {
		Code      string `json:"code" binding:"required"`
		PassIndex int    `json:"pass_index" binding:"required"`
		Name      string `json:"name" binding:"required"`
	}

	CreateShaderPayload struct {
		Title         string                    `json:"title" binding:"required"`
		Description   string                    `json:"description" binding:"required"`
		PreviewImgURL string                    `json:"preview_img_url"`
		AccessLevel   AccessLevel               `json:"access_level" binding:"required"`
		RenderPasses  []CreateRenderPassPayload `json:"render_passes" binding:"required"`
	}

	ShaderWithRenderPasses struct {
		Shader       Shader       `json:"shader"`
		RenderPasses []RenderPass `json:"render_passes"`
	}

	ShadersListWithUsernames struct {
		Shaders   []ShaderWithRenderPasses `json:"shaders"`
		Usernames []string                 `json:"usernames"`
	}

	ShaderRepository interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accAccessLevel AccessLevel) ([]Shader, error)
		GetShadersListWithRenderPasses(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderWithRenderPasses, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderWithRenderPasses, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderWithRenderPasses, error)
		// CreateRenderPass(ctx context.Context, payload CreateRenderPassPayload) error
	}

	ShaderService interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accesLevel AccessLevel) ([]Shader, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderWithRenderPasses, error)
		GetShadersListWithRenderPasses(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderWithRenderPasses, error)
		GetShaderListWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) (*ShadersListWithUsernames, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderWithRenderPasses, error)
	}
)
