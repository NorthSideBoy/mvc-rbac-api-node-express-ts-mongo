import path from "node:path";

export const file = {
	ext: (file: File) => path.extname(file.name).replace(".", ""),
	buffer: async (file: File) => {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		return buffer;
	},
} as const;
