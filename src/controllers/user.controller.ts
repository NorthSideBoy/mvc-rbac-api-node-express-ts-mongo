import {
	Body,
	Controller,
	Delete,
	Get,
	Path,
	Post,
	Put,
	Queries,
	Request,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from "tsoa";
import { ExecutionContext } from "../context/execution-context";
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
import { UserService } from "../services/user.service";
import type { ExtendedRequest } from "../types/extended-request.type";

@Route("users")
@Tags("Users")
export class UserController extends Controller {
	private createContext(request: ExtendedRequest): ExecutionContext {
		return request.access
			? ExecutionContext.createFromGrant(request.access)
			: ExecutionContext.createAnonymous();
	}

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
		@Request() request: ExtendedRequest,
	): Promise<AuthenticatedUser> {
		const userService = new UserService(this.createContext(request));
		return userService.register(body);
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
	async login(
		@Body() body: LoginUser | unknown,
		@Request() request: ExtendedRequest,
	): Promise<AuthenticatedUser> {
		const userService = new UserService(this.createContext(request));
		return userService.login(body);
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
	async search(
		@Queries() query: QueryUsers,
		@Request() request: ExtendedRequest,
	): Promise<Search<User>> {
		const userService = new UserService(this.createContext(request));
		return userService.search(query);
	}

	/**
	 * @summary Get user by id
	 */
	@Get("/{id}")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(404, "NotFound")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	async findById(
		@Path() id: string,
		@Request() request: ExtendedRequest,
	): Promise<User | null> {
		const userService = new UserService(this.createContext(request));
		return userService.findById(id);
	}

	/**
	 * @summary Get users
	 */
	@Get("/")
	@SuccessResponse(200)
	@Response(401, "Unauthorized")
	@Response(500, "InternalServerError")
	@Security("Bearer", [Role.USER])
	async findAll(@Request() request: ExtendedRequest): Promise<User[]> {
		const userService = new UserService(this.createContext(request));
		return userService.findAll();
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
	async create(
		@Body() body: CreateUser | unknown,
		@Request() request: ExtendedRequest,
	): Promise<User> {
		this.setStatus(201);
		const userService = new UserService(this.createContext(request));
		return userService.create(body);
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
	async update(
		@Path() id: string,
		@Body() body: UpdateUserProfile | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updateProfile(id, body);
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
	async updateStatus(
		@Path() id: string,
		@Body() body: UpdateUserStatus | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updateStatus(id, body);
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
	async updateRole(
		@Path() id: string,
		@Body() body: UpdateUserRole | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updateRole(id, body);
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
	async updatePassword(
		@Path() id: string,
		@Body() body: UpdateUserPassword | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updatePassword(id, body);
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
	async updateEmail(
		@Path() id: string,
		@Body() body: UpdateUserEmail | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updateEmail(id, body);
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
	async updateUsername(
		@Path() id: string,
		@Body() body: UpdateUserUsername | unknown,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.updateUsername(id, body);
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
	async delete(
		@Path() id: string,
		@Request() request: ExtendedRequest,
	): Promise<Result> {
		const userService = new UserService(this.createContext(request));
		return userService.delete(id);
	}
}
