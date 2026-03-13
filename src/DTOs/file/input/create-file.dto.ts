import type { FileVisibility } from "../../../enums/file-visibility.enum";
import type { Mimetype } from "../../../enums/mimetype.enum";

export type CreateFile = {
	alt: string;
	filename: string;
	size: number;
	mimetype: Mimetype;
	ext: string;
	path: string;
	visibility?: FileVisibility;
};
