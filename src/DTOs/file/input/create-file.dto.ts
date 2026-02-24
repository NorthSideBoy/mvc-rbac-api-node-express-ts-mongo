import type { File as Types } from "../../../types/file.type";

type FileType = Types.Create;

export default class CreateFile {
	name: string;
}

const _typeCheck: FileType = {} as CreateFile;
