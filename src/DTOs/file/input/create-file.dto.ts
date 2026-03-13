import type { IFile } from "../../../contracts/file.contract";
import type { FileVisibility } from "../../../enums/file-visibility.enum";

export type CreateFile = Omit<
	IFile,
	"id" | "createdAt" | "updatedAt" | "visibility"
> & { visibility?: FileVisibility };
