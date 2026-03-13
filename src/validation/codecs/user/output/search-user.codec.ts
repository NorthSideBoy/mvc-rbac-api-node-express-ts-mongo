import z from "zod";
import { paginationCodec } from "../../operation/output/pagination.codec";
import { userCodec } from "./user.codec";

export const searchUserCodec = z
	.object({
		docs: z.array(userCodec),
		pagination: paginationCodec,
	})
	.strict();
