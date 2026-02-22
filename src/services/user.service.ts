import { result } from "../builders/result.builder";
import { createUserCodec } from "../codecs/user/create-user.codec";
import { loginUserCodec } from "../codecs/user/login-user.codec";
import { searchUsersCodec } from "../codecs/user/query-users.codec";
import { registerUserCodec } from "../codecs/user/register-user.codec";
import { updateUserEmailCodec } from "../codecs/user/update-user-email.codec";
import { updateUserPasswordCodec } from "../codecs/user/update-user-password.codec";
import { updateUserProfileCodec } from "../codecs/user/update-user-profile.codec";
import { updateUserRoleCodec } from "../codecs/user/update-user-role.codec";
import { updateUserStatusCodec } from "../codecs/user/update-user-status.codec";
import { updateUserUsernameCodec } from "../codecs/user/update-user-username.codec";
import { context } from "../context/context.handler";
import type ExecutionContext from "../context/execution-context";
import type { Result } from "../DTOs/operation/output/result.dto";
import type { Search } from "../DTOs/operation/output/search.dto";
import type { CreateUser } from "../DTOs/user/input/create-user.dto";
import type { LoginUser } from "../DTOs/user/input/login-user.dto";
import type { QueryUsers } from "../DTOs/user/input/query-users.dto";
import type { RegisterUser } from "../DTOs/user/input/register-user.dto";
import type { UpdateUserEmail } from "../DTOs/user/input/update-user-email.dto";
import type { UpdateUserPassword } from "../DTOs/user/input/update-user-password.dto";
import type { UpdateUserProfile } from "../DTOs/user/input/update-user-profile.dto";
import type { UpdateUserRole } from "../DTOs/user/input/update-user-role.dto";
import type { UpdateUserStatus } from "../DTOs/user/input/update-user-status.dto";
import type { UpdateUserUsername } from "../DTOs/user/input/update-user-username.dto";
import type { AuthenticatedUser } from "../DTOs/user/output/authenticated-user.dto";
import type { User as DTO } from "../DTOs/user/output/user.dto";
import { PermissionDeniedError } from "../errors/authorization/permission-denied.error";
import { DuplicatePasswordError } from "../errors/user/duplicate-password.error";
import { EmailInUseError } from "../errors/user/email-in-use.error";
import { InvalidUserCredentialsError } from "../errors/user/invalid-user-credentials.error";
import { UserNotFoundError } from "../errors/user/user-not-found.error";
import { UsernameInUseError } from "../errors/user/username-in-use.error";
import { roleToRBACRole, updateRoleToRole } from "../mappers/role.mapper";
import { toAuthenticated } from "../mappers/user.mapper";
import User from "../models/user.model";
import { OPERATIONS } from "../rbac/constants/operations.constant";
import Actor from "../rbac/models/actor.model";
import { tokenizer } from "../utils/tokenizer.util";
import { decode } from "../utils/validator.util";

export default class UserService {
	constructor(readonly ctx: ExecutionContext = context.get()) {}

	private async getByIdOrThrow(id: string) {
		const user = await User.findById(id);
		if (!user) throw new UserNotFoundError();
		return user;
	}

	private async checkUserUniqueness(input: RegisterUser | CreateUser) {
		const [isEmailTaken, isUsernameTaken] = await Promise.all([
			User.isEmailAvailable(input.email),
			User.isUsernameAvailable(input.username),
		]);

		if (!isEmailTaken) throw new EmailInUseError(input.email);
		if (!isUsernameTaken) throw new UsernameInUseError(input.username);
	}

	async register(input: unknown): Promise<AuthenticatedUser> {
		const decoded = decode<RegisterUser>(registerUserCodec, input);
		if (!this.ctx.actor.can(OPERATIONS.USER_READ))
			throw new PermissionDeniedError();
		await this.checkUserUniqueness(decoded);
		const created = await User.create(decoded);
		const token = tokenizer.sign({
			sub: created.id,
			username: created.username,
			role: created.role,
			enable: created.enable,
		});
		return toAuthenticated(created, token);
	}

	async login(input: unknown): Promise<AuthenticatedUser> {
		const decoded = decode<LoginUser>(loginUserCodec, input);
		if (!this.ctx.actor.can(OPERATIONS.USER_READ))
			throw new PermissionDeniedError();
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
		return toAuthenticated(user, token);
	}

	async findById(id: string): Promise<DTO | null> {
		if (!this.ctx.actor.can(OPERATIONS.USER_READ))
			throw new PermissionDeniedError();
		const user = await User.findById(id);
		if (!user) return null;
		return user.secure;
	}

	async findAll(): Promise<DTO[]> {
		if (!this.ctx.actor.can(OPERATIONS.USER_READ))
			throw new PermissionDeniedError();
		const users = await User.find();
		return users.map((user) => user.secure);
	}

	async search(input: unknown): Promise<Search<DTO>> {
		const decoded = decode<QueryUsers>(searchUsersCodec, input);
		if (!this.ctx.actor.can(OPERATIONS.USER_READ))
			throw new PermissionDeniedError();
		const result = await User.search(decoded);
		const docs = result.docs.map((user) => user.secure);
		return {
			docs,
			pagination: result.pagination,
		};
	}

	async create(input: unknown): Promise<DTO> {
		const decoded = decode<CreateUser>(createUserCodec, input);
		if (
			!this.ctx.actor.canManage(
				OPERATIONS.USER_CREATE,
				Actor.dummy(decoded.role),
			)
		)
			throw new PermissionDeniedError();
		if (!this.ctx.actor.canAssign(decoded.role))
			throw new PermissionDeniedError();
		await this.checkUserUniqueness(decoded);
		const user = await User.create(decoded);
		return user.secure;
	}

	async updateProfile(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserProfile>(updateUserProfileCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_PROFILE, user))
			throw new PermissionDeniedError();
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateStatus(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserStatus>(updateUserStatusCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_STATUS, user))
			throw new PermissionDeniedError();
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateRole(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserRole>(updateUserRoleCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_ROLE, user))
			throw new PermissionDeniedError();
		const role = updateRoleToRole(decoded.role);
		const RBACRole = roleToRBACRole(role);
		if (!this.ctx.actor.canAssign(RBACRole)) throw new PermissionDeniedError();
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updatePassword(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserPassword>(updateUserPasswordCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_PASSWORD, user))
			throw new PermissionDeniedError();
		const isSame = await user.comparePassword(decoded.password);
		if (isSame) throw new DuplicatePasswordError();
		const operation = await User.updatePassword(id, decoded.password);
		return result(operation.modifiedCount);
	}

	async updateEmail(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserEmail>(updateUserEmailCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_EMAIL, user))
			throw new PermissionDeniedError();
		const isEmailAvailable = await User.isEmailAvailable(decoded.email, id);
		if (!isEmailAvailable) throw new EmailInUseError(decoded.email);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async updateUsername(id: string, input: unknown): Promise<Result> {
		const decoded = decode<UpdateUserUsername>(updateUserUsernameCodec, input);
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_UPDATE_USERNAME, user))
			throw new PermissionDeniedError();
		const isUsernameAvailable = await User.isUsernameAvailable(
			decoded.username,
			id,
		);
		if (!isUsernameAvailable) throw new UsernameInUseError(decoded.username);
		const operation = await User.updateOne({ _id: id }, decoded);
		return result(operation.modifiedCount);
	}

	async delete(id: string): Promise<Result> {
		const user = await this.getByIdOrThrow(id);
		if (!this.ctx.actor.canManage(OPERATIONS.USER_DELETE, user))
			throw new PermissionDeniedError();
		const operation = await User.deleteOne({ _id: id });
		return result(operation.deletedCount);
	}
}
