import type { FileVisibility } from "../../../enums/file-visibility.enum";
import type { Mimetype } from "../../../enums/mimetype.enum";

export type UpdateFile = {
	alt?: string;
	filename?: string;
	size?: number;
	ext?: string;
	mimetype?: Mimetype;
	visibility?: FileVisibility;
};
