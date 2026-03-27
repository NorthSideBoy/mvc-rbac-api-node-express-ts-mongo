import type { Response } from "express";
import type { ExtendedRequest } from "../../common/types/extended-request.type";

export interface GraphQLContext {
	req: ExtendedRequest;
	res: Response;
}
