import type { Readable } from "node:stream";
import type { FileUpload } from "graphql-upload/processRequest.mjs";
import { lookup } from "mime-types";
import { createFile } from "../../../factories/file.factory";

export default class BaseResolver {
	private async streamToBuffer(stream: Readable): Promise<Buffer> {
		const chunks: Buffer[] = [];
		return new Promise((resolve, reject) => {
			stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
			stream.on("error", (err) => reject(err));
			stream.on("end", () => resolve(Buffer.concat(chunks)));
		});
	}

	protected async handleUpload(
		upload?: Promise<FileUpload>,
	): Promise<File | undefined> {
		if (!upload) return undefined;
		const fileUpload = await upload;
		const stream = fileUpload.createReadStream();
		const buffer = await this.streamToBuffer(stream);
		const mimetype = lookup(fileUpload.filename) || fileUpload.mimetype;

		return createFile(buffer, fileUpload.filename, {
			type: mimetype,
		});
	}
}
