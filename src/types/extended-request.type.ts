import type { Request } from "express";
import type { AccessGrant } from "../security/access-grant";

export type ExtendedRequest = Request & { access?: AccessGrant };
