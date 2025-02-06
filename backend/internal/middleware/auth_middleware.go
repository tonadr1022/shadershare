package middleware

import (
	"net/http"
	"shadershare/internal/auth"
	"shadershare/internal/domain"

	"github.com/gin-gonic/gin"
)

type jwtHeader struct {
	Authorization string `header:"Authorization"`
}

type contextKey int

const userKey contextKey = iota

func Auth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		session, err := auth.GetStore().Get(ctx.Request, "session_id")
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		// get acces token
		accessToken, ok := session.Values["access_token"]
		if !ok {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		// session,err := store
		// session, err := gothic.Store.Get(ctx.Request, gothic.SessionName)
		// if err != nil {
		// 	util.SetErrorResponse(ctx, http.StatusUnauthorized, "Unauthorized: failed to retrieve session.")
		// 	ctx.Abort()
		// 	return
		// }
		// userID, ok := session.Values["user_id"]
		// if !ok {
		// 	util.SetErrorResponse(ctx, http.StatusUnauthorized, "Unauthorized: cookie not found.")
		// }
		// userIDStr, ok := userID.(string)
		// if !ok {
		// 	util.SetErrorResponse(ctx, http.StatusInternalServerError, "Internal server error: user ID is not a string.")
		// 	ctx.Abort()
		// 	return
		// }
		// userIDuuid, err := uuid.Parse(userIDStr)
		// if err != nil {
		// 	util.SetErrorResponse(ctx, http.StatusInternalServerError, "Internal server error: failed to parse user ID.")
		// 	ctx.Abort()
		// 	return
		// }
		// userctx := &domain.UserCtx{ID: userIDuuid}
		// ctx.Set("currentUser", userctx)
		// ctx.Next()
	}
}

func CurrentUser(ctx *gin.Context) (*domain.UserCtx, bool) {
	user, exists := ctx.Get("currentUser")
	if !exists {
		return nil, false
	}
	userCtx, ok := user.(*domain.UserCtx)
	if !ok {
		return nil, false
	}
	return userCtx, true
}
