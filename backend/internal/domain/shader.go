package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type (
	Shader struct {
		ID          uuid.UUID `json:"id"`
		Title       string    `json:"title"`
		Description string    `json:"description"`
		UserID      string    `json:"user_id"`
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
	}

	RenderPass struct {
		ID        uuid.UUID `json:"id"`
		ShaderID  string    `json:"shader_id"`
		Code      string    `json:"code"`
		PassIndex int       `json:"pass_index"`
	}

	CreateRenderPassForShaderPayload struct {
		ShaderID  string `json:"shader_id" binding:"required"`
		Code      string `json:"code" binding:"required"`
		PassIndex int    `json:"pass_index" binding:"required"`
	}

	CreateRenderPassPayload struct {
		Code      string `json:"code" binding:"required"`
		PassIndex int    `json:"pass_index" binding:"required"`
	}

	CreateShaderPayload struct {
		Title        string                    `json:"title" binding:"required"`
		Description  string                    `json:"description" binding:"required"`
		RenderPasses []CreateRenderPassPayload `json:"render_passes" binding:"required"`
	}

	ShaderWithRenderPasses struct {
		Shader       Shader       `json:"shader"`
		RenderPasses []RenderPass `json:"render_passes"`
	}

	ShaderRepository interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]Shader, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderWithRenderPasses, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		// CreateRenderPass(ctx context.Context, payload CreateRenderPassPayload) error
	}

	ShaderService interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]Shader, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderWithRenderPasses, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
	}
)
