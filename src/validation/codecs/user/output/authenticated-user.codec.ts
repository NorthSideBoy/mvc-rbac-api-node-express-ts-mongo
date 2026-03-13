import z from "zod";
import { jwtSchema } from "../../../schemas/common.schemas";
import { userCodec } from "./user.codec";

export const authenticatedUserCodec = z
	.object({
		...userCodec.shape,
		token: jwtSchema,
	})
	.strict();
