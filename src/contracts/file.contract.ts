import type { FileVisibility } from "../enums/file-visibility.enum";
import type { Mimetype } from "../enums/mimetype.enum";
import type IEntity from "./entity.contract";

export interface IFile extends IEntity {
	alt: string;
	filename: string;
	size: number;
	mimetype: Mimetype;
	path: string;
	ext: string;
	visibility: FileVisibility;
}
