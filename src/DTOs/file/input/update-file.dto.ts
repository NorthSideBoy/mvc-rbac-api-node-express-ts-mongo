import type { CreateFile } from "./create-file.dto";

export type UpdateFile = Partial<Omit<CreateFile, "path">>;
