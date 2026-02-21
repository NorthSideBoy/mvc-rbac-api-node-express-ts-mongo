import { ExecutionContext } from "../context/execution-context";
import type { Role } from "../enums/role.enum";
import { ApplicationError } from "../errors/application-error";
import MethodNotAllowedError from "../errors/http/method-not-allowed.error";
import UnauthorizedError from "../errors/http/unauthorized.error";
import HttpError from "../errors/http.error";
import { AccessClaims } from "../security/access-claims";
import { AccessGrant } from "../security/access-grant";
import type { ExtendedRequest } from "../types/extended-request.type";
import { tokenizer } from "../utils/tokenizer.util";

export async function expressAuthentication(
	request: ExtendedRequest,
	securityName: string,
	allowed: Role[],
): Promise<unknown> {
	try {
		switch (securityName) {
			case "Bearer": {
				const authorization = request.headers.authorization;
				if (!authorization)
					throw new UnauthorizedError("Missing authorization headers");
				return await handleBearerAuth(authorization, request, allowed);
			}
			default:
				throw new MethodNotAllowedError(
					`Authentication method '${securityName}' not allowed`,
				);
		}
	} catch (error) {
		if (error instanceof HttpError || error instanceof ApplicationError)
			throw error;
		throw new UnauthorizedError("Authentication failed");
	}
}

async function handleBearerAuth(
	authHeader: string,
	request: ExtendedRequest,
	allowed: Role[],
): Promise<unknown> {
	const token = extractBearerToken(authHeader);
	if (!token) throw new UnauthorizedError("Invalid Bearer token format");
	const payload = tokenizer.verify(token);
	const claims = AccessClaims.fromPayload(payload);
	const grant = AccessGrant.issue(claims, allowed);
	request.access = grant;
	ExecutionContext.enterWithGrant(grant);
	return grant.claims.raw;
}

function extractBearerToken(authHeader: string): string | null {
	const [scheme, token] = authHeader.trim().split(/\s+/);
	if (scheme !== "Bearer") return null;
	return token || null;
}
