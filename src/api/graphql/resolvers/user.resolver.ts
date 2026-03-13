import {
	Arg,
	Ctx,
	Mutation,
	Query,
	Resolver,
	UseMiddleware,
} from "type-graphql";
import { Role } from "../../../enums/role.enum";
import UserService from "../../../services/user.service";
import type { ExtendedRequest } from "../../../types/extended-request.type";
import { mapper } from "../../../utils/mapper.util";
import { authGuard } from "../middlewares/auth.middleware";
import { contextMiddleware } from "../middlewares/context.middleware";
import { authLimiter } from "../middlewares/rate-limiter.middleware";
import PaginationGQL from "../schemas/common/pagination.schema";
import ResultGQL from "../schemas/operation/output/result.schema";
// biome-ignore lint: GQL schemas should not be type
import CreateUserGQL from "../schemas/user/input/create-user.schema";
// biome-ignore lint: GQL schemas should not be type
import LoginUserGQL from "../schemas/user/input/login-user.schema";
// biome-ignore lint: GQL schemas should not be type
import QueryUsersGQL from "../schemas/user/input/query-users.schema";
// biome-ignore lint: GQL schemas should not be type
import RegisterUserGQL from "../schemas/user/input/register-user.schema";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserEmailGQL from "../schemas/user/input/update-user-email.schema";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserPasswordGQL from "../schemas/user/input/update-user-passoword.schema";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserProfileGQL from "../schemas/user/input/update-user-profile.schema";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserRoleGQL from "../schemas/user/input/update-user-role.schema";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserStatusGQL from "../schemas/user/input/update-user-status.scehma";
// biome-ignore lint: GQL schemas should not be type
import UpdateUserUsernameGQL from "../schemas/user/input/update-user-username.schema";
import AuthenticatedUserGQL from "../schemas/user/output/authenticated-user.schema";
import UserGQL from "../schemas/user/output/user.schema";
import UsersSearchGQL from "../schemas/user/output/users-search.schema";

@Resolver()
export default class UserResolver {
	@Mutation(() => AuthenticatedUserGQL)
	async register(
		@Arg("data") data: RegisterUserGQL,
	): Promise<AuthenticatedUserGQL> {
		const userService = new UserService();
		const result = await userService.register(data);
		const gql = mapper.toClass(AuthenticatedUserGQL, result);

		return gql;
	}

	@Mutation(() => AuthenticatedUserGQL)
	@UseMiddleware(authLimiter())
	async login(@Arg("data") data: LoginUserGQL): Promise<AuthenticatedUserGQL> {
		const userService = new UserService();
		const result = await userService.login(data);
		const gql = mapper.toClass(AuthenticatedUserGQL, result);

		return gql;
	}

	@Query(() => UsersSearchGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async search(
		@Ctx() ctx: ExtendedRequest,
		@Arg("query", { nullable: true }) query?: QueryUsersGQL,
	): Promise<UsersSearchGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.search(query ?? {});
		const docs = result.docs.map((item) => mapper.toClass(UserGQL, item));
		const pagination = mapper.toClass(PaginationGQL, result.pagination);
		const gql = mapper.toClass(UsersSearchGQL, { docs, pagination });

		return gql;
	}

	@Query(() => UserGQL, { nullable: true })
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async findById(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
	): Promise<UserGQL | null> {
		const userService = new UserService(ctx.context);
		const result = await userService.findById(id);
		if (!result) return null;
		const gql = mapper.toClass(UserGQL, result);

		return gql;
	}

	@Query(() => [UserGQL])
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async getUsers(@Ctx() ctx: ExtendedRequest): Promise<UserGQL[]> {
		const userService = new UserService(ctx.context);
		const result = await userService.findAll();
		const gql = result.map((item) => mapper.toClass(UserGQL, item));

		return gql;
	}

	@Mutation(() => UserGQL)
	@UseMiddleware([authGuard("Bearer", [Role.MANAGER]), contextMiddleware()])
	async create(
		@Ctx() ctx: ExtendedRequest,
		@Arg("data") data: CreateUserGQL,
	): Promise<UserGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.create(data);
		const gql = mapper.toClass(UserGQL, result);
		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async update(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserProfileGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updateProfile(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.MANAGER]), contextMiddleware()])
	async updateStatus(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserStatusGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updateStatus(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.ADMIN]), contextMiddleware()])
	async updateRole(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserRoleGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updateRole(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updatePassword(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserPasswordGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updatePassword(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updateEmail(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserEmailGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updateEmail(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updateUsername(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserUsernameGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.updateUsername(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.ADMIN]), contextMiddleware()])
	async delete(
		@Ctx() ctx: ExtendedRequest,
		@Arg("id") id: string,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.context);
		const result = await userService.delete(id);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}
}
