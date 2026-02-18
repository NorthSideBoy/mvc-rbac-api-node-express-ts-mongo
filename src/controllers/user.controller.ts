import {
	Body,
	Controller,
	Delete,
	Get,
	Path,
	Post,
	Put,
	Request,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from "tsoa";
import type { Result } from "../DTOs/operation/output/result.dto";
import type { CreateUser } from "../DTOs/user/input/create-user.dto";
import type { LoginUser } from "../DTOs/user/input/login-user.dto";
import type { RegisterUser } from "../DTOs/user/input/register-user.dto";
import type { UpdateUserEmail } from "../DTOs/user/input/update-user-email.dto";
import type { UpdateUserPassword } from "../DTOs/user/input/update-user-password.dto";
import type { UpdateUserProfile } from "../DTOs/user/input/update-user-profile.dto";
import type { UpdateUserRole } from "../DTOs/user/input/update-user-role.dto";
import type { UpdateUserStatus } from "../DTOs/user/input/update-user-status.dto";
import type { UpdateUserUsername } from "../DTOs/user/input/update-user-username.dto";
import type { AuthenticatedUser } from "../DTOs/user/output/authenticated-user.dto";
import type { User } from "../DTOs/user/output/user.dto";
import { Role } from "../rbac/role";
import { UserService } from "../services/user.service";
import type { ExtendedRequest } from "../types/extended-request.type";

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
		@Request() _request: ExtendedRequest,
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
	async login(
		@Body() body: LoginUser | unknown,
		@Request() _request: ExtendedRequest,
	): Promise<AuthenticatedUser> {
		return this.userService.login(body);
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
		return this.userService.findById(id, request.access);
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
		return this.userService.findAll(request.access);
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
		return this.userService.create(body, request.access);
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
		return this.userService.updateProfile(id, body, request.access);
	}

	/**
	 * @summary Enable or disable user
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
		return this.userService.updateStatus(id, body, request.access);
	}

	/**
	 * @summary Promote or demote user role
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
		return this.userService.updateRole(id, body, request.access);
	}

	/**
	 * @summary Update user password
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
		return this.userService.updatePassword(id, body, request.access);
	}

	/**
	 * @summary Update user email
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
		return this.userService.updateEmail(id, body, request.access);
	}

	/**
	 * @summary Update user username
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
		return this.userService.updateUsername(id, body, request.access);
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
		return this.userService.delete(id, request.access);
	}
}
