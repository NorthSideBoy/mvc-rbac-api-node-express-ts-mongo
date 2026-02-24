import type { Mimetype } from "../../../enums/mimetype.enum";
import type { File as Types } from "../../../types/file.type";

type FileType = Types.Schema;

export default class File {
	id: string;
	name: string;
	filename: string;
	size: number;
	mimetype: Mimetype;
	ext: string;
	url: string;
	createdAt: Date;
	updatedAt: Date;
}

const _typeCheck: FileType = {} as File;
