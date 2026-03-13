import {
	Body,
	Delete,
	FormField,
	Get,
	Middlewares,
	Path,
	Post,
	Put,
	Queries,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
	UploadedFile,
} from "tsoa";
import type Result from "../../../DTOs/operation/output/result.dto";
import type { LoginUser } from "../../../DTOs/user/input/login-user.dto";
import type { QueryUsers } from "../../../DTOs/user/input/query-users.dto";
import type { UpdateUserEmail } from "../../../DTOs/user/input/update-user-email.dto";
import type { UpdateUserPassword } from "../../../DTOs/user/input/update-user-password.dto";
import type { UpdateUserProfile } from "../../../DTOs/user/input/update-user-profile.dto";
import type { UpdateUserRole } from "../../../DTOs/user/input/update-user-role.dto";
import type { UpdateUserStatus } from "../../../DTOs/user/input/update-user-status.dto";
import type { UpdateUserUsername } from "../../../DTOs/user/input/update-user-username.dto";
import type { AuthenticatedUser } from "../../../DTOs/user/output/authenticated-user.dto";
import type { User } from "../../../DTOs/user/output/user.dto";
import type { UsersSearch } from "../../../DTOs/user/output/users-search";
import { Role, type UpdateRole } from "../../../enums/role.enum";
import UserService from "../../../services/user.service";
import { contextMiddleware } from "../middlewares/context.middleware";
import { authLimiter } from "../middlewares/rate-limiter.middleware";
import { BaseController } from "./base.controller";

@Route("users")
@Tags("Users")
export class UserController extends BaseController {
	private readonly userService = new UserService();
	/**
	 * @summary Register user
	 */
	@Post("/register")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	async register(
		@FormField() firstname: string,
		@FormField() lastname: string,
		@FormField() username: string,
		@FormField() email: string,
		@FormField() password: string,
		@FormField() birthday: Date,
		@FormField() enable?: boolean,
		@UploadedFile() upload?: Express.Multer.File,
	): Promise<AuthenticatedUser> {
		return await this.userService.register({
			firstname,
			lastname,
			username,
			email,
			password,
			birthday,
			enable,
			picture: this.handleFile(upload),
		});
	}

	/**
	 * @summary Login user
	 */
	@Post("/login")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Middlewares([authLimiter])
	async login(@Body() body: LoginUser | unknown): Promise<AuthenticatedUser> {
		return await this.userService.login(body);
	}

	/**
	 * @summary Search users
	 */
	@Get("/search")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async search(@Queries() query: QueryUsers): Promise<UsersSearch> {
		return await this.userService.search(query);
	}

	/**
	 * @summary Get user by id
	 */
	@Get("/{id}")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async findById(@Path() id: string): Promise<User | null> {
		return await this.userService.findById(id);
	}

	/**
	 * @summary Get users
	 */
	@Get("/")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async findAll(): Promise<User[]> {
		return await this.userService.findAll();
	}

	/**
	 * @summary Create user
	 */
	@Post("/")
	@SuccessResponse(201)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.MANAGER])
	@Middlewares([contextMiddleware])
	async create(
		@FormField() firstname: string,
		@FormField() lastname: string,
		@FormField() username: string,
		@FormField() email: string,
		@FormField() password: string,
		@FormField() role: UpdateRole,
		@FormField() birthday: Date,
		@FormField() enable?: boolean,
		@UploadedFile() upload?: Express.Multer.File,
	): Promise<User> {
		this.setStatus(201);
		return await this.userService.create({
			firstname,
			lastname,
			username,
			email,
			password,
			role,
			birthday,
			enable,
			picture: this.handleFile(upload),
		});
	}

	/**
	 * @summary Update user profile by id
	 */
	@Put("/{id}")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async update(
		@Path() id: string,
		@Body() body: UpdateUserProfile | unknown,
	): Promise<Result> {
		return await this.userService.updateProfile(id, body);
	}

	/**
	 * @summary Enable or disable user by id
	 */
	@Put("/{id}/status")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.MANAGER])
	@Middlewares([contextMiddleware])
	async updateStatus(
		@Path() id: string,
		@Body() body: UpdateUserStatus | unknown,
	): Promise<Result> {
		return await this.userService.updateStatus(id, body);
	}

	/**
	 * @summary Promote or demote user role by id
	 */
	@Put("/{id}/role")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.ADMIN])
	@Middlewares([contextMiddleware])
	async updateRole(
		@Path() id: string,
		@Body() role: UpdateUserRole | unknown,
	): Promise<Result> {
		return await this.userService.updateRole(id, role);
	}

	/**
	 * @summary Update user password by id
	 */
	@Put("/{id}/password")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updatePassword(
		@Path() id: string,
		@Body() body: UpdateUserPassword | unknown,
	): Promise<Result> {
		return await this.userService.updatePassword(id, body);
	}

	/**
	 * @summary Update user email by id
	 */
	@Put("/{id}/email")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updateEmail(
		@Path() id: string,
		@Body() body: UpdateUserEmail | unknown,
	): Promise<Result> {
		return await this.userService.updateEmail(id, body);
	}

	/**
	 * @summary Update user username by id
	 */
	@Put("/{id}/username")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updateUsername(
		@Path() id: string,
		@Body() body: UpdateUserUsername | unknown,
	): Promise<Result> {
		return await this.userService.updateUsername(id, body);
	}

	/**
	 * @summary Update user picture by id
	 */
	@Put("/{id}/picture")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updatePicture(
		@Path() id: string,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Result> {
		const input = { picture: this.handleFile(file) };
		return await this.userService.updatePicture(id, input);
	}

	/**
	 * @summary Delete user by id
	 */
	@Delete("/{id}")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.ADMIN])
	@Middlewares([contextMiddleware])
	async delete(@Path() id: string): Promise<Result> {
		return await this.userService.delete(id);
	}

	/**
	 * @summary Delete user picture by id
	 */
	@Delete("/{id}/picture")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async deletePicture(@Path() id: string): Promise<Result> {
		return await this.userService.deletePicture(id);
	}
}
