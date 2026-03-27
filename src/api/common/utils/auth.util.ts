import type { Role } from "../../../enums/role.enum";
import MethodNotAllowedError from "../../../errors/http/method-not-allowed.error";
import UnauthorizedError from "../../../errors/http/unauthorized.error";
import { isApplicationError, isHttpError } from "../../../guards/error.guard";
import { AccessClaims } from "../../../security/access-claims";
import { AccessGrant } from "../../../security/access-grant";
import { tokenizer } from "../../../utils/tokenizer.util";

type AuthStrategy = (
	authHeader: string,
	allowed: Role[],
) => Promise<AccessGrant>;

const authStrategies = new Map<string, AuthStrategy>([
	[
		"Bearer",
		async (authHeader, allowed) => {
			const token = extractBearerToken(authHeader);
			("");
			if (!token) throw new UnauthorizedError("Invalid Bearer token format");

			const payload = tokenizer.verify(token);
			const claims = AccessClaims.fromPayload(payload);
			const grant = AccessGrant.issue(claims, allowed);

			return grant;
		},
	],
]);

export async function authorize(
	authorization: string | undefined,
	securityName: string,
	allowed: Role[],
): Promise<AccessGrant> {
	try {
		const strategy = authStrategies.get(securityName);
		if (!strategy)
			throw new MethodNotAllowedError(
				`Authentication method '${securityName}' not allowed`,
			);
		if (!authorization)
			throw new UnauthorizedError("Missing authorization headers");

		return await strategy(authorization, allowed);
	} catch (error) {
		if (isHttpError(error) || isApplicationError(error)) throw error;

		throw new UnauthorizedError("Authentication failed");
	}
}

function extractBearerToken(authHeader: string): string | null {
	const [scheme, token] = authHeader.trim().split(/\s+/);
	return scheme === "Bearer" ? token || null : null;
}
