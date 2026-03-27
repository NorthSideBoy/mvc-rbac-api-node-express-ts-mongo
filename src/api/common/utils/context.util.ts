import ExecutionContext from "../../../context/execution-context";
import type { AccessGrant } from "../../../security/access-grant";

export function contextualize(
	access: AccessGrant | undefined,
): ExecutionContext {
	const context = access
		? ExecutionContext.fromGrant(access)
		: ExecutionContext.anonymous();

	return context;
}
