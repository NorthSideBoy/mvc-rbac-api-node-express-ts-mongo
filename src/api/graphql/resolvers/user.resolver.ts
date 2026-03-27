import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import type { FileUpload } from "graphql-upload/processRequest.mjs";
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
import { mapper } from "../../../utils/mapper.util";
import { authGuard } from "../middlewares/auth.middleware";
import { contextMiddleware } from "../middlewares/context.middleware";
import PaginationGQL from "../schemas/common/pagination.schema";
import ResultGQL from "../schemas/operation/output/result.schema";
// biome-ignore lint: GQL schemas should not be type
import CreateUserGQL from "../schemas/user/input/create-user.schema";
// biome-ignore lint: GQL schemas should not be type
import QueryUsersGQL from "../schemas/user/input/query-users.schema";
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
import UserGQL from "../schemas/user/output/user.schema";
import UsersSearchGQL from "../schemas/user/output/users-search.schema";
import type { GraphQLContext } from "../types/graphql-context.type";
import BaseResolver from "./base.resolver";

@Resolver()
export default class UserResolver extends BaseResolver {
	@Query(() => UserGQL, { nullable: true })
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async findById(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
	): Promise<UserGQL | null> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.findById(id);
		if (!result) return null;
		const gql = mapper.toClass(UserGQL, result);

		return gql;
	}

	@Query(() => [UserGQL])
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async getUsers(@Ctx() ctx: GraphQLContext): Promise<UserGQL[]> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.findAll();
		const gql = result.map((item) => mapper.toClass(UserGQL, item));

		return gql;
	}

	@Query(() => UsersSearchGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async search(
		@Ctx() ctx: GraphQLContext,
		@Arg("query", { nullable: true }) query?: QueryUsersGQL,
	): Promise<UsersSearchGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.search(query ?? {});
		const docs = result.docs.map((item) => mapper.toClass(UserGQL, item));
		const pagination = mapper.toClass(PaginationGQL, result.pagination);
		const gql = mapper.toClass(UsersSearchGQL, { docs, pagination });

		return gql;
	}

	@Mutation(() => UserGQL)
	@UseMiddleware([authGuard("Bearer", [Role.MANAGER]), contextMiddleware()])
	async create(
		@Ctx() ctx: GraphQLContext,
		@Arg("data") data: CreateUserGQL,
		@Arg("upload", () => GraphQLUpload) upload: Promise<FileUpload>,
	): Promise<UserGQL> {
		const picture = await this.handleUpload(upload);
		const userService = new UserService(ctx.req.context);
		const result = await userService.create(Object.assign({ picture }, data));
		const gql = mapper.toClass(UserGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async update(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserProfileGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updateProfile(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.MANAGER]), contextMiddleware()])
	async updateStatus(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserStatusGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updateStatus(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.ADMIN]), contextMiddleware()])
	async updateRole(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserRoleGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updateRole(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updatePassword(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserPasswordGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updatePassword(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updateEmail(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserEmailGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updateEmail(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updateUsername(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("data") data: UpdateUserUsernameGQL,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.updateUsername(id, data);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.USER]), contextMiddleware()])
	async updatePicture(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
		@Arg("upload", () => GraphQLUpload) upload: Promise<FileUpload>,
	): Promise<ResultGQL> {
		const picture = await this.handleUpload(upload);
		const userService = new UserService(ctx.req.context);
		const result = await userService.updatePicture(id, { picture });
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@Mutation(() => ResultGQL)
	@UseMiddleware([authGuard("Bearer", [Role.ADMIN]), contextMiddleware()])
	async delete(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.delete(id);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}

	@UseMiddleware([authGuard("Bearer", [Role.ADMIN]), contextMiddleware()])
	async deletePicture(
		@Ctx() ctx: GraphQLContext,
		@Arg("id") id: string,
	): Promise<ResultGQL> {
		const userService = new UserService(ctx.req.context);
		const result = await userService.deletePicture(id);
		const gql = mapper.toClass(ResultGQL, result);

		return gql;
	}
}
