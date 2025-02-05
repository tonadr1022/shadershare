package config

var (
	// JWTSecret   string
	IsProd        bool
	AuthBaseURL   string
	SessionSecret string
)

func LoadConfig() {
	// JWTSecret = os.Getenv("JWT_SECRET")
	// if JWTSecret == "" {
	// 	log.Fatal("JWT_SECRET is not set")
	// }
}
