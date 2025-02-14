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

	ShaderInput struct {
		ID       uuid.UUID `json:"id"`
		ShaderID string    `json:"shader_id"`
		Url      string    `json:"url"`
		Type     string    `json:"type"`
		Idx      int       `json:"pass_index"`
		Name     string    `json:"name"`
	}

	ShaderOutput struct {
		ID       uuid.UUID `json:"id"`
		ShaderID string    `json:"shader_id"`
		Code     string    `json:"code"`
		Name     string    `json:"name"`
		Type     string    `json:"type"`
		Idx      int       `json:"pass_index"`
	}

	UpdateShaderInputPayload struct {
		ID   uuid.UUID `json:"id" binding:"required"`
		Url  *string   `json:"url,omitempty"`
		Type *string   `json:"type,omitempty"`
		Idx  *int      `json:"pass_index,omitempty"`
		Name *string   `json:"name,omitempty"`
	}

	CreateShaderInputPayload struct {
		ShaderID uuid.UUID `json:"shader_id" binding:"required"`
		Url      *string   `json:"url,omitempty"`
		Type     string    `json:"type" binding:"required"`
		Idx      int       `json:"pass_index" binding:"required"`
		Name     string    `json:"name" binding:"required"`
	}

	UpdateShaderOutputPayload struct {
		ID   uuid.UUID `json:"id" binding:"required"`
		Code *string   `json:"code,omitempty"`
		Name *string   `json:"name,omitempty"`
		Type *string   `json:"type,omitempty"`
		Idx  *int      `json:"pass_index,omitempty"`
	}

	CreateShaderOutputPayload struct {
		ShaderID uuid.UUID `json:"shader_id" binding:"required"`
		Code     string    `json:"code" binding:"required"`
		Name     string    `json:"name" binding:"required"`
		Type     string    `json:"type" binding:"required"`
		Idx      int       `json:"pass_index" binding:"required"`
	}
	UpdateShaderPayload struct {
		ID            uuid.UUID                   `json:"id" binding:"required"`
		UserID        uuid.UUID                   `json:"user_id" binding:"required"`
		Title         *string                     `json:"title,omitempty"`
		Description   *string                     `json:"description,omitempty"`
		PreviewImgURL *string                     `json:"preview_img_url,omitempty"`
		AccessLevel   *AccessLevel                `json:"access_level,omitempty"`
		ShaderInputs  []UpdateShaderInputPayload  `json:"shader_inputs,omitempty"`
		ShaderOutputs []UpdateShaderOutputPayload `json:"shader_outputs,omitempty"`
	}

	CreateRenderPassPayload struct {
		Code      string `json:"code" binding:"required"`
		PassIndex int    `json:"pass_index" binding:"required"`
		Name      string `json:"name" binding:"required"`
	}

	CreateShaderPayload struct {
		Title         string                      `json:"title" binding:"required"`
		Description   string                      `json:"description" binding:"required"`
		PreviewImgURL string                      `json:"preview_img_url"`
		AccessLevel   AccessLevel                 `json:"access_level" binding:"required"`
		ShaderInputs  []CreateShaderInputPayload  `json:"shader_inputs" binding:"required"`
		ShaderOutputs []CreateShaderOutputPayload `json:"shader_outputs" binding:"required"`
	}

	ShaderDetailed struct {
		Shader        Shader         `json:"shader"`
		ShaderInputs  []ShaderInput  `json:"shader_inputs"`
		ShaderOutputs []ShaderOutput `json:"shader_outputs"`
	}

	ShadersDetailedWithUsernames struct {
		Shaders   []ShaderDetailed `json:"shaders"`
		Usernames []string         `json:"usernames"`
	}

	ShaderRepository interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accAccessLevel AccessLevel) ([]Shader, error)
		GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderDetailed, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderDetailed, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderDetailed, error)
		CreateShaderInput(ctx context.Context, input CreateShaderInputPayload) (*ShaderInput, error)
		CreateShaderOutput(ctx context.Context, output CreateShaderOutputPayload) (*ShaderOutput, error)
		DeleteShaderInput(ctx context.Context, inputID uuid.UUID) error
		DeleteShaderOutput(ctx context.Context, outputID uuid.UUID) error
	}

	ShaderService interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accesLevel AccessLevel) ([]Shader, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderDetailed, error)
		GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderDetailed, error)
		GetShadersDetailedWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) (*ShadersDetailedWithUsernames, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderDetailed, error)
		CreateShaderInput(ctx context.Context, input CreateShaderInputPayload) (*ShaderInput, error)
		CreateShaderOutput(ctx context.Context, output CreateShaderOutputPayload) (*ShaderOutput, error)
		DeleteShaderInput(ctx context.Context, inputID uuid.UUID) error
		DeleteShaderOutput(ctx context.Context, outputID uuid.UUID) error
	}
)
