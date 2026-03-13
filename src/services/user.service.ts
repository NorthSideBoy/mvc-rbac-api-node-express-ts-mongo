import { result } from "../builders/result.builder";
import type { CreateFile } from "../DTOs/file/input/create-file.dto";
import type { default as FileDTO } from "../DTOs/file/output/file.dto";
import type Result from "../DTOs/operation/output/result.dto";
import type Search from "../DTOs/operation/output/search.dto";
import type CreateUser from "../DTOs/user/input/create-user.dto";
import type LoginUser from "../DTOs/user/input/login-user.dto";
import type RegisterUser from "../DTOs/user/input/register-user.dto";
import type SearchUsers from "../DTOs/user/input/search-users.dto";
import type UpdateUserEmail from "../DTOs/user/input/update-user-email.dto";
import type UpdateUserPassword from "../DTOs/user/input/update-user-password.dto";
import type UpdateUserPicture from "../DTOs/user/input/update-user-picture.dto";
import type UpdateUserProfile from "../DTOs/user/input/update-user-profile.dto";
import type UpdateUserRole from "../DTOs/user/input/update-user-role.dto";
import type UpdateUserStatus from "../DTOs/user/input/update-user-status.dto";
import type UpdateUserUsername from "../DTOs/user/input/update-user-username.dto";
import type AuthenticatedUser from "../DTOs/user/output/authenticated-user.dto";
import type { default as DTO } from "../DTOs/user/output/user.dto";
import { DuplicatePasswordError } from "../errors/user/duplicate-password.error";
import { EmailInUseError } from "../errors/user/email-in-use.error";
import { InvalidUserCredentialsError } from "../errors/user/invalid-user-credentials.error";
import { UserNotFoundError } from "../errors/user/user-not-found.error";
import { UsernameInUseError } from "../errors/user/username-in-use.error";
import { extToMimetype } from "../mappers/mimetype.mapper";
import { roleToRBACRole, updateRoleToRole } from "../mappers/role.mapper";
import { toAuthenticated } from "../mappers/user.mapper";
import User from "../models/user.model";
import { OPERATIONS } from "../rbac/constants/operations.constant";
import Actor from "../rbac/models/actor.model";
import { file as fileUtil } from "../utils/file.util";
import { tokenizer } from "../utils/tokenizer.util";
import { decode } from "../utils/validator.util";
import { createUserCodec } from "../validation/codecs/user/input/create-user.codec";
import { loginUserCodec } from "../validation/codecs/user/input/login-user.codec";
import { registerUserCodec } from "../validation/codecs/user/input/register-user.codec";
import { searchUsersCodec } from "../validation/codecs/user/input/search-users.codec";
import { updateUserEmailCodec } from "../validation/codecs/user/input/update-user-email.codec";
import { updateUserPasswordCodec } from "../validation/codecs/user/input/update-user-password.codec";
import { updateUserPictureCodec } from "../validation/codecs/user/input/update-user-picture.codec";
import { updateUserProfileCodec } from "../validation/codecs/user/input/update-user-profile.codec";
import { updateUserRoleCodec } from "../validation/codecs/user/input/update-user-role.codec";
import { updateUserStatusCodec } from "../validation/codecs/user/input/update-user-status.codec";
import { updateUserUsernameCodec } from "../validation/codecs/user/input/update-user-username.codec";
import { authenticatedUserCodec } from "../validation/codecs/user/output/authenticated-user.codec";
import { userCodec } from "../validation/codecs/user/output/user.codec";
import BaseService from "./base.service";
import FileService from "./file.service";
import StorageService from "./storage.service";

export default class UserService extends BaseService {
	private readonly DEFAULT_USER_PICTURE_FILENAME = "default.jpeg";
	private readonly USER_PICTURE_PATH = "public/user";
	private readonly fileService = new FileService();
	private readonly storage = new StorageService();

	private async getUserByIdOrThrow(id: string) {
		const user = await User.findById(id);
		if (!user) throw new UserNotFoundError();
		return user;
	}

	private async validateUserUniqueness(
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

	private async getDefaultPictureId(): Promise<string> {
		const existingPicture = await this.findDefaultPicture();
		if (existingPicture) return existingPicture.id;
		const defaultPicture = await this.createDefaultPicture();
		return defaultPicture.id;
	}

	private async saveUserPicture(file: File): Promise<CreateFile> {
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

	private async processUserPicture(file?: File): Promise<string> {
		if (!file) return this.getDefaultPictureId();
		const pictureData = await this.saveUserPicture(file);
		const created = await this.fileService.create(pictureData);
		return created.id;
	}

	async register(input: RegisterUser | unknown): Promise<AuthenticatedUser> {
		const decoded = decode<RegisterUser>(registerUserCodec, input);
		await this.validateUserUniqueness(decoded);
		const pictureId = await this.processUserPicture(decoded.picture);
		const user = await User.create({ ...decoded, picture: pictureId });
		const token = tokenizer.sign({
			sub: user.id,
			username: user.username,
			role: user.role,
			enable: user.enable,
		});
		return toAuthenticated(user, token);
	}

	async login(input: LoginUser | unknown): Promise<AuthenticatedUser> {
		const decoded = decode<LoginUser>(loginUserCodec, input);
		const user = await User.findByEmail(decoded.email);
		if (!user) throw new InvalidUserCredentialsError();
		const isValid = await user.comparePassword(decoded.password);
		if (!isValid) throw new InvalidUserCredentialsError();
		const token = tokenizer.sign({
			sub: user.id,
			username: user.username,
			role: user.role,
			enable: user.enable,
		});
		const authenticatedUser = toAuthenticated(user, token);
		return decode<AuthenticatedUser>(authenticatedUserCodec, authenticatedUser);
	}

	async create(input: CreateUser | unknown): Promise<DTO> {
		const decoded = decode<CreateUser>(createUserCodec, input);
		this.canManage(OPERATIONS.USER_CREATE, Actor.dummy(decoded.role));
		this.canAssign(decoded.role);
		await this.validateUserUniqueness(decoded);
		const pictureId = await this.processUserPicture(decoded.picture);
		const user = await User.create({ ...decoded, picture: pictureId });
		return decode<DTO>(userCodec, user.secure);
	}

	async findById(id: string): Promise<DTO | null> {
		this.can(OPERATIONS.USER_READ);
		const user = await User.findById(id);
		if (!user) return null;
		return decode<DTO>(userCodec, user.secure);
	}

	async findAll(): Promise<DTO[]> {
		this.can(OPERATIONS.USER_READ);
		const users = await User.find();
		return users.map((user) => decode<DTO>(userCodec, user.secure));
	}

	async search(input: SearchUsers): Promise<Search<DTO>> {
		const decoded = decode<SearchUsers>(searchUsersCodec, input);
		this.can(OPERATIONS.USER_READ);
		const result = await User.search(decoded);
		return {
			docs: result.docs.map((user) => decode<DTO>(userCodec, user.secure)),
			pagination: result.pagination,
		};
	}

	async updateProfile(
		id: string,
		input: UpdateUserProfile | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserProfile>(updateUserProfileCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_PROFILE, user);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateStatus(
		id: string,
		input: UpdateUserStatus | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserStatus>(updateUserStatusCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_STATUS, user);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateRole(
		id: string,
		input: UpdateUserRole | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserRole>(updateUserRoleCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_ROLE, user);
		const role = updateRoleToRole(decoded.role);
		const rbacRole = roleToRBACRole(role);
		this.canAssign(rbacRole);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updatePassword(
		id: string,
		input: UpdateUserPassword | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserPassword>(updateUserPasswordCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_PASSWORD, user);
		const isSamePassword = await user.comparePassword(decoded.password);
		if (isSamePassword) throw new DuplicatePasswordError();
		const operation = await User.updatePassword(id, decoded.password);
		return result(operation.modifiedCount);
	}

	async updateEmail(
		id: string,
		input: UpdateUserEmail | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserEmail>(updateUserEmailCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_EMAIL, user);
		const isEmailAvailable = await User.isEmailAvailable(decoded.email, id);
		if (!isEmailAvailable) throw new EmailInUseError(decoded.email);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateUsername(
		id: string,
		input: UpdateUserUsername | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserUsername>(updateUserUsernameCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_USERNAME, user);
		const isUsernameAvailable = await User.isUsernameAvailable(
			decoded.username,
			id,
		);
		if (!isUsernameAvailable) throw new UsernameInUseError(decoded.username);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updatePicture(
		id: string,
		input: UpdateUserPicture | unknown,
	): Promise<Result> {
		const decoded = decode<UpdateUserPicture>(updateUserPictureCodec, input);
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_UPDATE_PICTURE, user);
		const picture = user.secure.picture;
		const hasDefaultPicture =
			picture.filename === this.DEFAULT_USER_PICTURE_FILENAME;
			
		if (hasDefaultPicture) {
			const newPictureId = await this.processUserPicture(decoded.picture);
			const operation = await User.updateOne(
				{ _id: id },
				{ picture: newPictureId },
			);
			return result(operation.modifiedCount);
		}
		const overwritten = await this.storage.overwrite({
			filepath: picture.path,
			filename: picture.filename,
			file: decoded.picture,
		});
		const ext = fileUtil.ext(overwritten);
		const size = overwritten.size;
		const mimetype = extToMimetype(ext);
		return this.fileService.update(picture.id, {
			filename: overwritten.name,
			ext,
			size,
			mimetype,
		});
	}

	async delete(id: string): Promise<Result> {
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_DELETE, user);
		const picture = user.secure.picture;
		if (picture.filename !== this.DEFAULT_USER_PICTURE_FILENAME)
			await Promise.all([
				this.fileService.delete(picture.id),
				this.storage.delete(picture.path, picture.filename),
			]);
		const operation = await User.deleteOne({ _id: id });
		return result(operation.deletedCount);
	}

	async deletePicture(id: string): Promise<Result> {
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_DELETE_PICTURE, user);
		const picture = user.secure.picture;
		const hasDefaultPicture =
			picture.filename === this.DEFAULT_USER_PICTURE_FILENAME;
		if (hasDefaultPicture) return result(0);
		await Promise.all([
			this.fileService.delete(picture.id),
			this.storage.delete(picture.path, picture.filename),
		]);
		const defaultPictureId = await this.getDefaultPictureId();
		const operation = await User.updateOne(
			{ _id: id },
			{ picture: defaultPictureId },
		);
		return result(operation.modifiedCount);
	}
}
