package auth

import (
	"fmt"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

var store *sessions.CookieStore

func GetStore() *sessions.CookieStore {
	return store
}

func NewAuth(isProd bool, authBaseURL string, maxAge int, sessionSecret string) {
	store = sessions.NewCookieStore([]byte(sessionSecret))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.Domain = "localhost"
	store.Options.Secure = false
	store.Options.HttpOnly = true
	// store.Options.SameSite = http.SameSiteNoneMode
	gothic.Store = store
	goth.UseProviders(
		google.New(os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"), fmt.Sprintf("%s/auth/google/callback", authBaseURL)))
}
