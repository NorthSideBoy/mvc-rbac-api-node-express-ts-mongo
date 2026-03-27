import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import type { FileUpload } from "graphql-upload/processRequest.mjs";
import { Arg, Mutation, Resolver, UseMiddleware } from "type-graphql";
import AuthService from "../../../services/auth.service";
import { mapper } from "../../../utils/mapper.util";
import { authLimiter } from "../middlewares/rate-limiter.middleware";
// biome-ignore lint: GQL schemas should not be type
import LoginUserGQL from "../schemas/auth/input/login-user.schema";
// biome-ignore lint: GQL schemas should not be type
import RegisterUserGQL from "../schemas/auth/input/register-user.schema";
import AuthenticatedUserGQL from "../schemas/auth/output/authenticated-user.schema";
import BaseResolver from "./base.resolver";

@Resolver()
export default class AuthResolver extends BaseResolver {
	private readonly authService = new AuthService();

	@Mutation(() => AuthenticatedUserGQL)
	async register(
		@Arg("data") data: RegisterUserGQL,
		@Arg("upload", () => GraphQLUpload) upload: Promise<FileUpload>,
	): Promise<AuthenticatedUserGQL> {
		const picture = await this.handleUpload(upload);
		const result = await this.authService.register(
			Object.assign({ picture }, data),
		);
		const gql = mapper.toClass(AuthenticatedUserGQL, result);

		return gql;
	}

	@Mutation(() => AuthenticatedUserGQL)
	@UseMiddleware(authLimiter())
	async login(@Arg("data") data: LoginUserGQL): Promise<AuthenticatedUserGQL> {
		const result = await this.authService.login(data);
		const gql = mapper.toClass(AuthenticatedUserGQL, result);

		return gql;
	}
}
