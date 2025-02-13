package domain

type AccessLevel int

const (
	AccessLevelPrivate AccessLevel = iota
	AccessLevelPublic
	AccessLevelUnlisted
)
