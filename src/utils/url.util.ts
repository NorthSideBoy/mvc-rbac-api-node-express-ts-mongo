import { config } from "../configs/env.config";

export const url = {
	from: (path: string): string => {
		const baseUrl = config.server.publicUrl;
		const cleanPath = path.replace(/^\/+|\/+$/g, "").trim();
		return `${baseUrl}/${cleanPath}`;
	},
};
