import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApplicationErrorCode } from "../enums/application-error-code.enum";
import { ApplicationError } from "../errors/application-error";
import HttpError from "../errors/http.error";
import { logger } from "../utils/logger.util";

export const errorMiddleware: ErrorRequestHandler = (
	error,
	_request,
	response,
	next,
) => {
	if (error instanceof ZodError) {
		logger.error({ err: error }, "[HTTP] validation error");
		const message = error.issues
			.map((i) =>
				i.path.length > 0
					? `${i.path.join(".")}: ${i.message}`
					: `${i.message}`,
			)
			.join("; ");
		return response.status(422).json({
			message,
			code: "VALIDATION_ERROR",
			details: error.issues,
		});
	}

	if (error instanceof HttpError) {
		return response.status(error.status).json({
			message: error.message,
			code: error.code,
		});
	}

	if (error instanceof ApplicationError) {
		logger.error({ err: error }, "[HTTP] application error");
		const statusMap: Record<string, number> = {
			[ApplicationErrorCode.UserNotFound]: 404,
			[ApplicationErrorCode.EmailInUse]: 409,
			[ApplicationErrorCode.InvalidCredentials]: 401,
			[ApplicationErrorCode.PermissionDenied]: 403,
			[ApplicationErrorCode.TokenExpired]: 401,
			[ApplicationErrorCode.TokenTampered]: 401,
			[ApplicationErrorCode.TokenBefore]: 401,
			[ApplicationErrorCode.InternalError]: 500,
		};

		const status = statusMap[error.code] ?? 400;

		return response.status(status).json({
			message: error.message,
			code: error.code,
			details: error.details,
		});
	}

	if (error instanceof Error) {
		logger.error({ err: error }, "[HTTP] unexpected error");
		return response.status(500).json({
			message: "Internal server error",
			code: ApplicationErrorCode.InternalError,
		});
	}

	return next();
};
