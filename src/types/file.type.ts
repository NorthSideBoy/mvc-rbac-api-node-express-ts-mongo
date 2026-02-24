import type { Mimetype } from "../enums/mimetype.enum";

export namespace File {
	export type Schema = {
		id: string;
		name: string;
		filename: string;
		size: number;
		mimetype: Mimetype;
		ext: string;
		createdAt: Date;
		updatedAt: Date;
	};

	export type Create = Pick<Schema, "name">;
}
