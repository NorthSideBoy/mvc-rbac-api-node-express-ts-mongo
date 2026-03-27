import { result } from "../builders/result.builder";
import type Result from "../DTOs/operation/output/result.dto";
import type { CreateUser } from "../DTOs/user/input/create-user.dto";
import type { QueryUsers } from "../DTOs/user/input/query-users.dto";
import type { UpdateUserEmail } from "../DTOs/user/input/update-user-email.dto";
import type { UpdateUserPassword } from "../DTOs/user/input/update-user-password.dto";
import type { UpdateUserPicture } from "../DTOs/user/input/update-user-picture.dto";
import type { UpdateUserProfile } from "../DTOs/user/input/update-user-profile.dto";
import type { UpdateUserRole } from "../DTOs/user/input/update-user-role.dto";
import type { UpdateUserStatus } from "../DTOs/user/input/update-user-status.dto";
import type { UpdateUserUsername } from "../DTOs/user/input/update-user-username.dto";
import type { User as DTO } from "../DTOs/user/output/user.dto";
import type { UsersSearch } from "../DTOs/user/output/users-search";
import { DuplicatePasswordError } from "../errors/application/duplicate-password.error";
import { EmailInUseError } from "../errors/application/email-in-use.error";
import { UserNotFoundError } from "../errors/application/user-not-found.error";
import { UsernameInUseError } from "../errors/application/username-in-use.error";
import { EVENTS } from "../events/constants/events.conts";
import UserHelper from "../helpers/user.helper";
import { extToMimetype } from "../mappers/mimetype.mapper";
import { roleToRBACRole, updateRoleToRole } from "../mappers/role.mapper";
import User from "../models/user.model";
import { OPERATIONS } from "../rbac/constants/operations.constant";
import Actor from "../rbac/models/actor.model";
import { file as fileUtil } from "../utils/file.util";
import { decode } from "../utils/validator.util";
import { createUserCodec } from "../validation/codecs/user/input/create-user.codec";
import { searchUsersCodec } from "../validation/codecs/user/input/search-users.codec";
import { updateUserEmailCodec } from "../validation/codecs/user/input/update-user-email.codec";
import { updateUserPasswordCodec } from "../validation/codecs/user/input/update-user-password.codec";
import { updateUserPictureCodec } from "../validation/codecs/user/input/update-user-picture.codec";
import { updateUserProfileCodec } from "../validation/codecs/user/input/update-user-profile.codec";
import { updateUserRoleCodec } from "../validation/codecs/user/input/update-user-role.codec";
import { updateUserStatusCodec } from "../validation/codecs/user/input/update-user-status.codec";
import { updateUserUsernameCodec } from "../validation/codecs/user/input/update-user-username.codec";
import BaseService from "./base.service";
import FileService from "./file.service";
import StorageService from "./storage.service";

export default class UserService extends BaseService {
	private readonly storage = new StorageService();
	private readonly fileService = new FileService();
	private readonly userHelper = new UserHelper();

	private async getUserByIdOrThrow(id: string) {
		const user = await User.findById(id);
		if (!user) throw new UserNotFoundError();

		return user;
	}

	async create(input: CreateUser | unknown): Promise<DTO> {
		const decoded = decode<CreateUser>(createUserCodec, input);
		this.canManage(OPERATIONS.USER_CREATE, Actor.dummy(decoded.role));
		this.canAssign(decoded.role);
		await this.userHelper.validateUserUniqueness(decoded);
		const pictureId = await this.userHelper.processUserPicture(decoded.picture);
		const user = await User.create({ ...decoded, picture: pictureId });
		this.emit(EVENTS.USER.CREATED, {
			id: user.id,
			username: user.username,
			role: user.role,
		});

		return user.dto();
	}

	async findById(id: string): Promise<DTO | null> {
		this.can(OPERATIONS.USER_READ);
		const user = await User.findById(id);
		if (!user) return null;

		this.emit(EVENTS.USER.READED, {
			id: user.id,
			username: user.username,
			role: user.role,
		});

		return user.dto();
	}

	async findAll(): Promise<DTO[]> {
		this.can(OPERATIONS.USER_READ);
		const users = await User.find();

		return users.map((user) => user.dto());
	}

	async search(input: QueryUsers | unknown): Promise<UsersSearch> {
		const decoded = decode<QueryUsers>(searchUsersCodec, input);
		this.can(OPERATIONS.USER_READ);
		const result = await User.search(decoded);

		return {
			docs: result.docs.map((user) => user.dto()),
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

		this.emit(EVENTS.USER.PROFILE_UPDATED, {
			id,
			firstname: decoded.firstname,
			lastname: decoded.lastname,
			birthday: decoded.birthday,
		});

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
		const picture = user.dto().picture;
		if (this.userHelper.isDefaultPicture(picture.filename)) {
			const newPictureId = await this.userHelper.processUserPicture(
				decoded.picture,
			);
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

		const operation = await this.fileService.update(picture.id, {
			filename: overwritten.name,
			ext,
			size,
			mimetype,
		});

		return operation;
	}

	async delete(id: string): Promise<Result> {
		const user = await this.getUserByIdOrThrow(id);
		this.canManage(OPERATIONS.USER_DELETE, user);
		const picture = user.dto().picture;
		if (!this.userHelper.isDefaultPicture(picture.filename))
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
		const picture = user.dto().picture;
		if (this.userHelper.isDefaultPicture(picture.filename)) return result(0);
		await Promise.all([
			this.fileService.delete(picture.id),
			this.storage.delete(picture.path, picture.filename),
		]);
		const defaultPictureId = await this.userHelper.getDefaultPictureId();
		const operation = await User.updateOne(
			{ _id: id },
			{ picture: defaultPictureId },
		);

		return result(operation.modifiedCount);
	}
}
