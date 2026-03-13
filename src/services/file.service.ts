import { result } from "../builders/result.builder";
import type { CreateFile } from "../DTOs/file/input/create-file.dto";
import type { UpdateFile } from "../DTOs/file/input/update-file.dto";
import type { File as DTO } from "../DTOs/file/output/file.dto";
import type Result from "../DTOs/operation/output/result.dto";
import File from "../models/file.model";
import { decode } from "../utils/validator.util";
import { CreateFileCodec } from "../validation/codecs/file/input/create-file.codec";
import { UpdateFileCodec } from "../validation/codecs/file/input/update-file.codec";
import BaseService from "./base.service";

export default class FileService extends BaseService {
	async create(input: CreateFile): Promise<DTO> {
		const decoded = decode<CreateFile>(CreateFileCodec, input);
		const file = await File.create(decoded);
		return file.dto();
	}

	async findByFilename(filename: string): Promise<DTO | null> {
		const file = await File.findByFilename(filename);
		return file?.dto() || null;
	}

	async update(id: string, input: UpdateFile): Promise<Result> {
		const decoded = decode<UpdateFile>(UpdateFileCodec, input);
		const operation = await File.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async delete(id: string): Promise<Result> {
		const operation = await File.deleteOne({ _id: id });
		return result(operation.deletedCount);
	}
}
