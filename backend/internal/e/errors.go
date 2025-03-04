package e

import "errors"

// TODO: move to domain
var (
	ErrAlreadyExists         = errors.New("resource already exists")
	ErrNotFound              = errors.New("resource not found")
	ErrInvalidCredentials    = errors.New("invalid credentials")
	ErrMalformedRequest      = errors.New("malformed request")
	ErrUsernameAlreadyExists = errors.New("user with this email already exists")
	ErrEmailAlreadyExists    = errors.New("user with this username already exists")
	ErrUserNotFound          = errors.New("user not found")
	ErrShaderWithTitleExists = errors.New("shader with title exists")
	ErrInvalidSort           = errors.New("invalid sort")
	ErrUnauthorized          = errors.New("unauthorized")
)
