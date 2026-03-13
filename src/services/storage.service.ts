import fs from "node:fs/promises";
import path from "node:path";
import type { OverwriteFile } from "../DTOs/storage/input/overwrite-file.dto";
import type { ReadFile } from "../DTOs/storage/input/read-file.dto";
import type { SaveFile } from "../DTOs/storage/input/save-file.dto";
import { ApplicationError } from "../errors/core/application-error";
import FileNotFoundError from "../errors/file/file-not-found.error";
import { file as fileUtil } from "../utils/file.util";
import { decode } from "../utils/validator.util";
import { overwriteFileCodec } from "../validation/codecs/storage/input/overwrite-file.codec";
import { readFileCodec } from "../validation/codecs/storage/input/read-file.codec";
import { saveFileCodec } from "../validation/codecs/storage/input/save-file.codec";
import BaseService from "./base.service";

export default class StorageService extends BaseService {
	private readonly STORAGE_PATH = path.join(process.cwd(), "storage");

	private getFullPath(filepath: string, filename: string): string {
		return path.join(this.STORAGE_PATH, filepath, filename);
	}

	private async fileExists(fullPath: string): Promise<boolean> {
		try {
			await fs.access(fullPath);
			return true;
		} catch {
			return false;
		}
	}

	private async directoryExists(dirPath: string): Promise<boolean> {
		try {
			const stats = await fs.stat(dirPath);
			return stats.isDirectory();
		} catch {
			return false;
		}
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		const exists = await this.directoryExists(dirPath);
		if (!exists) await fs.mkdir(dirPath, { recursive: true });
	}

	private async checkDirectory(fullPath: string): Promise<void> {
		const dirPath = path.dirname(fullPath);
		await this.ensureDirectoryExists(dirPath);
	}

	private async createFileFromBuffer(
		fullPath: string,
		buffer: Buffer,
	): Promise<File> {
		const uint8Array = new Uint8Array(buffer);
		return new File([uint8Array], path.basename(fullPath));
	}

	private async readFileAsFile(fullPath: string): Promise<File> {
		const exists = await this.fileExists(fullPath);
		if (!exists) throw new FileNotFoundError(`File not found at: ${fullPath}`);
		const buffer = await fs.readFile(fullPath);
		return this.createFileFromBuffer(fullPath, buffer);
	}

	async read(input: ReadFile): Promise<File> {
		const decoded = decode<ReadFile>(readFileCodec, input);
		const fullPath = this.getFullPath(decoded.filepath, decoded.filename);
		try {
			return await this.readFileAsFile(fullPath);
		} catch (error) {
			if (error instanceof ApplicationError) throw error;
			throw new FileNotFoundError(`Error reading file at: ${fullPath}`);
		}
	}

	async save(input: SaveFile): Promise<File> {
		const decoded = decode<SaveFile>(saveFileCodec, input);
		const extension = fileUtil.ext(decoded.file);
		const filename = `${Date.now()}.${extension}`;
		const fullPath = this.getFullPath(decoded.filepath, filename);
		await this.checkDirectory(fullPath);
		const buffer = await fileUtil.buffer(decoded.file);
		await fs.writeFile(fullPath, buffer);
		return this.readFileAsFile(fullPath);
	}

	async overwrite(input: OverwriteFile): Promise<File> {
		const decoded = decode<OverwriteFile>(overwriteFileCodec, input);
		const oldFullPath = this.getFullPath(decoded.filepath, decoded.filename);
		const exists = await this.fileExists(oldFullPath);
		if (!exists)
			throw new FileNotFoundError(
				`Cannot overwrite: File not found at: ${oldFullPath}`,
			);
		const parsedPath = path.parse(decoded.filename);
		const newExt = fileUtil.ext(decoded.file);
		const originalExt = parsedPath.ext;
		const shouldRename = newExt !== originalExt;
		const finalPath = shouldRename
			? this.getFullPath(decoded.filepath, `${parsedPath.name}.${newExt}`)
			: oldFullPath;
		if (shouldRename) await fs.rename(oldFullPath, finalPath);
		await fs.writeFile(finalPath, await fileUtil.buffer(decoded.file));
		return this.readFileAsFile(finalPath);
	}

	async delete(filepath: string, filename: string): Promise<void> {
		const fullPath = this.getFullPath(filepath, filename);
		const exists = await this.fileExists(fullPath);
		if (!exists)
			throw new FileNotFoundError(
				`Cannot delete: File not found at: ${fullPath}`,
			);
		await fs.unlink(fullPath);
	}
}
