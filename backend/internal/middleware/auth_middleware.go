package middleware

import (
	"context"
	"net/http"
	"shadershare/internal/domain"
	"shadershare/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type jwtHeader struct {
	Authorization string `header:"Authorization"`
}

func JWT() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var h jwtHeader
		err := ctx.ShouldBindHeader(&h)
		if err != nil {
			errs, ok := err.(validator.ValidationErrors)
			if !ok {
				ctx.JSON(http.StatusForbidden, util.ErrorResponse{
					Errors: []string{
						"Something went wrong",
					},
				})

				ctx.Abort()
				return
			}

			var errsMessage []string
			for _, err := range errs {
				errsMessage = append(errsMessage, err.Error())
			}

			ctx.JSON(http.StatusForbidden, util.ErrorResponse{
				Errors: errsMessage,
			})

			ctx.Abort()
			return
		}

		ctx.Next()
	}
}

type contextKey int

const userKey contextKey = iota

// returns the user identity from the given context, otherwise nil if not found
func CurrentUser(ctx context.Context) domain.Identity {
	if user, ok := ctx.Value(userKey).(domain.User); ok {
		return user
	}
	return nil
}
