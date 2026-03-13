import z from "zod";
import { imageSchema } from "../../../schemas/common.schemas";

export const updateUserPictureCodec = z
	.object({
		picture: imageSchema,
	})
	.strict();
