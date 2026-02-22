import {
	Body,
	Controller,
	Delete,
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
} from "tsoa";
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
import type { User } from "../DTOs/user/output/user.dto";
import { Role } from "../enums/role.enum";
import { contextMiddleware } from "../middlewares/context.middleware";
import UserService from "../services/user.service";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
	private readonly userService = new UserService();
	/**
	 * @summary Register user
	 */
	@Post("/register")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(500, "InternalServerError")
	async register(
		@Body() body: RegisterUser | unknown,
	): Promise<AuthenticatedUser> {
		return this.userService.register(body);
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
	@Response(500, "InternalServerError")
	async login(@Body() body: LoginUser | unknown): Promise<AuthenticatedUser> {
		return this.userService.login(body);
	}

	/**
	 * @summary Search users
	 */
	@Get("/search")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(422, "UnprocessableEntity")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async search(@Queries() query: QueryUsers): Promise<Search<User>> {
		return this.userService.search(query);
	}

	/**
	 * @summary Get user by id
	 */
	@Get("/{id}")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async findById(@Path() id: string): Promise<User | null> {
		return this.userService.findById(id);
	}

	/**
	 * @summary Get users
	 */
	@Get("/")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async findAll(): Promise<User[]> {
		return this.userService.findAll();
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.MANAGER])
	@Middlewares([contextMiddleware])
	async create(@Body() body: CreateUser | unknown): Promise<User> {
		this.setStatus(201);
		return this.userService.create(body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async update(
		@Path() id: string,
		@Body() body: UpdateUserProfile | unknown,
	): Promise<Result> {
		return this.userService.updateProfile(id, body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.MANAGER])
	@Middlewares([contextMiddleware])
	async updateStatus(
		@Path() id: string,
		@Body() body: UpdateUserStatus | unknown,
	): Promise<Result> {
		return this.userService.updateStatus(id, body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.ADMIN])
	@Middlewares([contextMiddleware])
	async updateRole(
		@Path() id: string,
		@Body() body: UpdateUserRole | unknown,
	): Promise<Result> {
		return this.userService.updateRole(id, body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updatePassword(
		@Path() id: string,
		@Body() body: UpdateUserPassword | unknown,
	): Promise<Result> {
		return this.userService.updatePassword(id, body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updateEmail(
		@Path() id: string,
		@Body() body: UpdateUserEmail | unknown,
	): Promise<Result> {
		return this.userService.updateEmail(id, body);
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
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	@Middlewares([contextMiddleware])
	async updateUsername(
		@Path() id: string,
		@Body() body: UpdateUserUsername | unknown,
	): Promise<Result> {
		return this.userService.updateUsername(id, body);
	}

	/**
	 * @summary Delete user by id
	 */
	@Delete("/{id}")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.ADMIN])
	@Middlewares([contextMiddleware])
	async delete(@Path() id: string): Promise<Result> {
		return this.userService.delete(id);
	}
}
