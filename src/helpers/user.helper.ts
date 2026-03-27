import { ObjectId } from "mongodb";
import type { Types } from "mongoose";
import type { RegisterUser } from "../DTOs/auth/input/register-user.dto";
import type { CreateFile } from "../DTOs/file/input/create-file.dto";
import type { File as FileDTO } from "../DTOs/file/output/file.dto";
import type { CreateUser } from "../DTOs/user/input/create-user.dto";
import { EmailInUseError } from "../errors/application/email-in-use.error";
import { UsernameInUseError } from "../errors/application/username-in-use.error";
import { extToMimetype } from "../mappers/mimetype.mapper";
import User from "../models/user.model";
import FileService from "../services/file.service";
import StorageService from "../services/storage.service";
import { file as fileUtil } from "../utils/file.util";

export default class UserHelper {
	private readonly DEFAULT_USER_PICTURE_FILENAME = "default.jpeg";
	private readonly USER_PICTURE_PATH = "public/user";
	private readonly fileService = new FileService();
	private readonly storage = new StorageService();

	async validateUserUniqueness(
		input: RegisterUser | CreateUser,
		excludeId?: string,
	): Promise<void> {
		const [isEmailAvailable, isUsernameAvailable] = await Promise.all([
			User.isEmailAvailable(input.email, excludeId),
			User.isUsernameAvailable(input.username, excludeId),
		]);
		if (!isEmailAvailable) throw new EmailInUseError(input.email);
		if (!isUsernameAvailable) throw new UsernameInUseError(input.username);
	}

	private async findDefaultPicture(): Promise<FileDTO | null> {
		return this.fileService.findByFilename(this.DEFAULT_USER_PICTURE_FILENAME);
	}

	private async createDefaultPicture(): Promise<FileDTO> {
		const defaultImage = await this.storage.read({
			filename: this.DEFAULT_USER_PICTURE_FILENAME,
			filepath: this.USER_PICTURE_PATH,
		});
		const extension = fileUtil.ext(defaultImage);

		return this.fileService.create({
			alt: "Default user profile picture",
			filename: this.DEFAULT_USER_PICTURE_FILENAME,
			size: defaultImage.size,
			mimetype: extToMimetype(extension),
			path: this.USER_PICTURE_PATH,
			ext: extension,
		});
	}

	async getDefaultPictureId(): Promise<Types.ObjectId> {
		const existingPicture = await this.findDefaultPicture();
		if (existingPicture)
			return ObjectId.createFromHexString(existingPicture.id);
		const defaultPicture = await this.createDefaultPicture();

		return ObjectId.createFromHexString(defaultPicture.id);
	}

	async saveUserPicture(file: File): Promise<CreateFile> {
		const saved = await this.storage.save({
			file,
			filepath: this.USER_PICTURE_PATH,
		});
		const extension = fileUtil.ext(saved);

		return {
			alt: "User profile picture",
			filename: saved.name,
			size: saved.size,
			mimetype: extToMimetype(extension),
			path: this.USER_PICTURE_PATH,
			ext: extension,
		};
	}

	async processUserPicture(file?: File): Promise<Types.ObjectId> {
		if (!file) return this.getDefaultPictureId();
		const pictureData = await this.saveUserPicture(file);
		const created = await this.fileService.create(pictureData);

		return ObjectId.createFromHexString(created.id);
	}

	isDefaultPicture(filename: string): boolean {
		return filename === this.DEFAULT_USER_PICTURE_FILENAME;
	}
}
