import type { Request } from "express";
import type { ExecutionContext } from "../context/execution-context";
import type { AccessGrant } from "../security/access-grant";

export type ExtendedRequest = Request & {
	access?: AccessGrant;
	context?: ExecutionContext;
};
