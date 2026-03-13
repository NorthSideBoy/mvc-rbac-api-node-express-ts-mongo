import type { OverwriteFile } from "./overwrite-file.dto";

export type SaveFile = Pick<OverwriteFile, "file" | "filepath">;
