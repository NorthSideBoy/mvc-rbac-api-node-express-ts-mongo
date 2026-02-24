import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApplicationErrorCode } from "../../../enums/application-error-code.enum";
import { HttpErrorCode } from "../../../enums/http-error-code.enum";
import { ApplicationError } from "../../../errors/core/application-error";
import HttpError from "../../../errors/core/http.error";
import { logger } from "../../../utils/logger.util";

export const errorMiddleware: ErrorRequestHandler = (
	error,
	_request,
	response,
	next,
) => {
	if (error instanceof ZodError) {
		logger.error({ error }, "[HTTP] validation error");
		const message = error.issues
			.map((i) =>
				i.path.length > 0
					? `${i.path.join(".")}: ${i.message}`
					: `${i.message}`,
			)
			.join("; ");
		return response.status(422).json({
			message,
			code: HttpErrorCode.UnprocessableEntity,
			metadata: error.issues,
		});
	}

	if (error instanceof HttpError) {
		logger.error({ error }, "[HTTP] expected error");
		return response.status(error.status).json({
			message: error.message,
			code: error.code,
		});
	}

	if (error instanceof ApplicationError) {
		logger.error({ error }, "[HTTP] application error");
		const statusMap: Record<string, number> = {
			[ApplicationErrorCode.UserNotFound]: 404,
			[ApplicationErrorCode.EmailInUse]: 409,
			[ApplicationErrorCode.UsernameInUse]: 409,
			[ApplicationErrorCode.InvalidCredentials]: 401,
			[ApplicationErrorCode.PermissionDenied]: 403,
			[ApplicationErrorCode.DuplicatePassword]: 409,
			[ApplicationErrorCode.UserDisabled]: 403,
			[ApplicationErrorCode.TokenExpired]: 401,
			[ApplicationErrorCode.TokenTampered]: 401,
			[ApplicationErrorCode.TokenBefore]: 401,
		};

		const status = statusMap[error.code] ?? 400;

		return response.status(status).json({
			message: error.message,
			code: error.code,
			metadata: error.metadata,
		});
	}

	if (error instanceof SyntaxError) {
		logger.error({ error }, "[HTTP] syntax error");
		return response.status(400).json({
			message: error.message,
			code: "SYNTAX_ERROR",
		});
	}

	if (error instanceof Error) {
		logger.error({ error }, "[HTTP] unexpected error");
		return response.status(500).json({
			message: "Internal server error",
			code: HttpErrorCode.InternalError,
		});
	}

	return next();
};
