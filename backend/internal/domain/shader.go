package domain

import (
	"context"
	"encoding/json"
	"mime/multipart"
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
		ID         uuid.UUID              `json:"id"`
		ShaderID   uuid.UUID              `json:"shader_id"`
		OutputID   uuid.UUID              `json:"output_id"`
		Url        string                 `json:"url"`
		Type       string                 `json:"type"`
		Idx        int                    `json:"idx"`
		Properties map[string]interface{} `json:"properties"`
	}

	ShaderOutput struct {
		ID           uuid.UUID     `json:"id"`
		ShaderID     uuid.UUID     `json:"shader_id"`
		Code         string        `json:"code"`
		Name         string        `json:"name"`
		Type         string        `json:"type"`
		ShaderInputs []ShaderInput `json:"shader_inputs"`
	}

	UpdateShaderInputPayload struct {
		ID         uuid.UUID               `json:"id" binding:"required"`
		Url        *string                 `json:"url,omitempty"`
		Type       *string                 `json:"type,omitempty"`
		Idx        *int                    `json:"idx,omitempty"`
		Properties *map[string]interface{} `json:"properties,omitempty"`
	}

	CreateShaderInputPayload struct {
		ShaderID   uuid.UUID               `json:"shader_id" binding:"required"`
		OutputID   uuid.UUID               `json:"output_id,omitempty"`
		Url        *string                 `json:"url,omitempty"`
		Type       string                  `json:"type" binding:"required"`
		Idx        int                     `json:"idx"`
		Properties *map[string]interface{} `json:"properties" binding:"required"`
	}

	UpdateShaderOutputPayload struct {
		ID   uuid.UUID `json:"id" binding:"required"`
		Code *string   `json:"code,omitempty"`
		Name *string   `json:"name,omitempty"`
		Type *string   `json:"type,omitempty"`
	}

	CreateShaderOutputPayload struct {
		ShaderID     uuid.UUID                  `json:"shader_id" binding:"required"`
		Code         string                     `json:"code" binding:"required"`
		Name         string                     `json:"name" binding:"required"`
		Type         string                     `json:"type" binding:"required"`
		ShaderInputs []CreateShaderInputPayload `json:"shader_inputs" binding:"required"`
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

	CreateShaderPayload struct {
		Title         string                      `json:"title" binding:"required"`
		Description   string                      `json:"description" binding:"required"`
		PreviewImgURL string                      `json:"preview_img_url"`
		AccessLevel   AccessLevel                 `json:"access_level" binding:"required"`
		ShaderOutputs []CreateShaderOutputPayload `json:"shader_outputs" binding:"required"`
	}

	ShaderDetailed struct {
		Shader        Shader         `json:"shader"`
		ShaderOutputs []ShaderOutput `json:"shader_outputs"`
	}

	ShaderDetailedResponse struct {
		Shader        Shader          `json:"shader"`
		ShaderOutputs json.RawMessage `json:"shader_outputs"`
	}

	ShaderWithUser struct {
		ShaderDetailedResponse
		Username string `json:"username"`
	}

	ShadersDetailedWithUsernames struct {
		Shaders []ShaderWithUser `json:"shaders"`
		Total   int64            `json:"total"`
	}

	ShaderRepository interface {
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accAccessLevel AccessLevel) ([]Shader, error)
		GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderDetailedResponse, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload) (*ShaderDetailed, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderDetailedResponse, error)
		CreateShaderInput(ctx context.Context, input CreateShaderInputPayload) (*ShaderInput, error)
		CreateShaderOutput(ctx context.Context, output CreateShaderOutputPayload) (*ShaderOutput, error)
		DeleteShaderInput(ctx context.Context, inputID uuid.UUID) error
		DeleteShaderOutput(ctx context.Context, outputID uuid.UUID) error
		DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) (*Shader, error)
		GetShaderCount(ctx context.Context) (int64, error)
		GetShaderWithUser(ctx context.Context, shaderID uuid.UUID) (*ShaderWithUser, error)
		GetShadersDetailedWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) (*ShadersDetailedWithUsernames, error)
	}

	ShaderService interface {
		GetShaderCount(ctx context.Context) (int64, error)
		GetShaderList(ctx context.Context, sort string, limit int, offset int, accesLevel AccessLevel) ([]Shader, error)
		CreateShader(ctx context.Context, userID uuid.UUID, shaderPayload CreateShaderPayload, file *multipart.FileHeader) (*ShaderDetailed, error)
		GetShadersListDetailed(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) ([]ShaderDetailedResponse, error)
		GetShadersDetailedWithUsernames(ctx context.Context, sort string, limit int, offset int, accessLevel AccessLevel) (*ShadersDetailedWithUsernames, error)
		GetUserShaderList(ctx context.Context, userID uuid.UUID, limit int, offset int) ([]Shader, error)
		UpdateShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID, updatePayload UpdateShaderPayload, file *multipart.FileHeader) (*Shader, error)
		GetShader(ctx context.Context, shaderID uuid.UUID) (*ShaderDetailedResponse, error)
		GetShaderWithUser(ctx context.Context, shaderID uuid.UUID) (*ShaderWithUser, error)
		CreateShaderInput(ctx context.Context, input CreateShaderInputPayload) (*ShaderInput, error)
		CreateShaderOutput(ctx context.Context, output CreateShaderOutputPayload) (*ShaderOutput, error)
		DeleteShaderInput(ctx context.Context, inputID uuid.UUID) error
		DeleteShaderOutput(ctx context.Context, outputID uuid.UUID) error
		DeleteShader(ctx context.Context, userID uuid.UUID, shaderID uuid.UUID) error
	}
)
