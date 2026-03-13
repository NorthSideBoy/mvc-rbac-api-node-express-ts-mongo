import type { Mimetype } from "../../../enums/mimetype.enum";

export default class File {
	id: string;
	alt: string;
	filename: string;
	size: number;
	mimetype: Mimetype;
	path: string;
	ext: string;
	url: string;
	createdAt: Date;
	updatedAt: Date;
}
