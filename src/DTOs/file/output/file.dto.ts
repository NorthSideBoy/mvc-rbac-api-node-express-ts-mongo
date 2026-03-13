import type { IFile } from "../../../contracts/file.contract";

export interface File extends IFile {
	url: string;
}
