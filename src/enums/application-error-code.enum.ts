export enum ApplicationErrorCode {
	UserNotFound = "USER_NOT_FOUND",
	EmailInUse = "EMAIL_IN_USE",
	UsernameInUse = "USERNAME_IN_USE",
	InvalidCredentials = "INVALID_CREDENTIALS",
	PermissionDenied = "PERMISSION_DENIED",
	UserDisabled = "USER_DISABLED",
	TokenExpired = "TOKEN_EXPIRED",
	TokenTampered = "TOKEN_TAMPERED",
	TokenBefore = "TOKEN_BEFORE",
	DuplicatePassword = "DUPLICATE_PASSWORD",
	FileNotFound = "FILE_NOT_FOUND",
}
