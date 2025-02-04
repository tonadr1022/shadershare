package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type (
	Shader struct {
		ID          uuid.UUID `json:"id"`
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

	CreateRenderPassPayload struct {
		ShaderID  string `json:"shader_id"`
		Code      string `json:"code"`
		PassIndex int    `json:"pass_index"`
	}

	CreateShaderPayload struct {
		Description string `json:"description"`
	}

	RenderPassCreatePayload struct {
		Code string `json:"code"`
	}

	ShaderRepository interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]Shader, error)
		// CreateShader(shader Shader) error
		// CreateRenderPass(ctx context.Context, payload CreateRenderPassPayload) error

		CreateShader(ctx context.Context, shader domain.Shader, renderPasses []domain.RenderPass) error
	}

	ShaderService interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int) ([]Shader, error)
	}
)
