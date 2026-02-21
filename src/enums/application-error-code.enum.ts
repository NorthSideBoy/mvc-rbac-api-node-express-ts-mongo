export enum ApplicationErrorCode {
	UserNotFound = "USER_NOT_FOUND",
	EmailInUse = "EMAIL_IN_USE",
	UsernameInUse = "USERNAME_IN_USE",
	InvalidCredentials = "INVALID_CREDENTIALS",
	PermissionDenied = "PERMISSION_DENIED",
	TokenExpired = "TOKEN_EXPIRED",
	TokenTampered = "TOKEN_TAMPERED",
	TokenBefore = "TOKEN_BEFORE",
	DuplicatePassword = "DUPLICATE_PASSWORD",
	InternalError = "INTERNAL_ERROR",
}
