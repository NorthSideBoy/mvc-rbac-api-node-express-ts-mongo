import { GraphQLError, type GraphQLFormattedError } from "graphql";
import { HttpErrorCode } from "../../../enums/http-error-code.enum";
import CoreError from "../../../errors/core/core.error";
import { logger } from "../../../utils/logger.util";

export const formatGraphQLError = (
	_formatted: GraphQLFormattedError,
	error: unknown,
) => {
	logger.error({ error }, "[GraphQL] error");
	if (error instanceof GraphQLError) {
		if (error.originalError instanceof CoreError) {
			return {
				message: error.message,
				code: error.originalError.code,
				metadata: error.originalError.metadata,
			};
		}
		return {
			message: error.message,
			code: error?.extensions?.code || "GRAPHQL_ERROR",
			metadata: error.extensions?.metadata,
		};
	}

	return {
		message: "Internal server error",
		code: HttpErrorCode.InternalError,
	};
};
