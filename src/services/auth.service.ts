import type { LoginUser } from "../DTOs/auth/input/login-user.dto";
import type { RegisterUser } from "../DTOs/auth/input/register-user.dto";
import type { AuthenticatedUser } from "../DTOs/auth/output/authenticated-user.dto";
import type { User as DTO } from "../DTOs/user/output/user.dto";
import { InvalidUserCredentialsError } from "../errors/application/invalid-user-credentials.error";
import { EVENTS } from "../events/constants/events.conts";
import UserHelper from "../helpers/user.helper";
import User from "../models/user.model";
import { tokenizer } from "../utils/tokenizer.util";
import { decode } from "../utils/validator.util";
import { loginUserCodec } from "../validation/codecs/auth/input/login-user.codec";
import { registerUserCodec } from "../validation/codecs/auth/input/register-user.codec";
import BaseService from "./base.service";

export default class AuthService extends BaseService {
	private readonly userHelper = new UserHelper();

	private toAuthenticated(user: DTO, token: string): AuthenticatedUser {
		return { ...user, token };
	}

	async register(input: RegisterUser | unknown): Promise<AuthenticatedUser> {
		const decoded = decode<RegisterUser>(registerUserCodec, input);
		await this.userHelper.validateUserUniqueness(decoded);
		const pictureId = await this.userHelper.processUserPicture(decoded.picture);
		const user = await User.create({ ...decoded, picture: pictureId });
		const token = tokenizer.sign(user.sign);

		return this.toAuthenticated(user.dto(), token);
	}

	async login(input: LoginUser | unknown): Promise<AuthenticatedUser> {
		const decoded = decode<LoginUser>(loginUserCodec, input);
		const user = await User.findByEmail(decoded.email);
		if (!user) throw new InvalidUserCredentialsError();
		const isValid = await user.comparePassword(decoded.password);
		if (!isValid) throw new InvalidUserCredentialsError();
		const token = tokenizer.sign(user.sign);
		const authenticated = this.toAuthenticated(user.dto(), token);
		this.emit(EVENTS.AUTH.ACCOUNT_LOGGED_IN, {
			id: authenticated.id,
			token: authenticated.token,
		});

		return authenticated;
	}
}
