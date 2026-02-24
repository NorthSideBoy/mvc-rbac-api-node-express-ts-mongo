import type { Role } from "../../../enums/role.enum";
import type { AccessGrant } from "../../../security/access-grant";
import type { ExtendedRequest } from "../../../types/extended-request.type";
import { authorize } from "../../common/auth.common";

export async function expressAuthentication(
	request: ExtendedRequest,
	securityName: string,
	allowed: Role[],
): Promise<AccessGrant> {
	const access = await authorize(
		request.headers.authorization,
		securityName,
		allowed,
	);
	request.access = access;
	return access;
}
