import type { Response } from "express";
import type { ExtendedRequest } from "./extended-request.type";

export interface GraphQLContext {
	req: ExtendedRequest;
	res: Response;
}
