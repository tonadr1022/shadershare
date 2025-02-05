package auth

import (
	"fmt"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

func NewAuth(isProd bool, authBaseURL string, maxAge int, sessionSecret string) {
	store := sessions.NewCookieStore([]byte(sessionSecret))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.Secure = isProd
	store.Options.HttpOnly = false // TODO:
	gothic.Store = store
	goth.UseProviders(
		google.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), fmt.Sprintf("%s/auth/google/callback", authBaseURL)))
}
