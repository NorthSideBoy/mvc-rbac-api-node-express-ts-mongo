import type { ReadFile } from "./read-file.dto";

export interface OverwriteFile extends ReadFile {
	file: File;
}
