import { confirm, input, password, select } from "@inquirer/prompts";
import {
	birthdaySchema,
	emailSchema,
	firstnameSchema,
	lastnameSchema,
	passwordSchema,
	usernameSchema,
} from "../src/codecs/user/fields.schema";
import { context } from "../src/context/context.handler";
import type ExecutionContext from "../src/context/execution-context";
import { Role } from "../src/enums/role.enum";
import { parseSchema } from "../src/helpers/parse-schema.helper";
import UserService from "../src/services/user.service";
import type { User } from "../src/types/user.type";
import { logger } from "../src/utils/logger.util";
import type Script from "./script.";

export default class CreateUser implements Script {
	readonly name = "create-user";
	readonly description = "Create a user";

	get ctx(): ExecutionContext {
		return context.get();
	}

	get userService(): UserService {
		return new UserService();
	}

	async run(): Promise<void> {
		const data: Partial<User.Create> = { enable: true };

		const answer = await confirm({
			message: "Do you want to create a user account?",
		});

		if (!answer) return;

		data.firstname = await input({
			message: "Enter user's firstname:",
			validate: parseSchema(firstnameSchema),
		});
		data.lastname = await input({
			message: "Enter user's lastname:",
			validate: parseSchema(lastnameSchema),
		});
		data.username = await input({
			message: "Enter user's username:",
			validate: parseSchema(usernameSchema),
		});
		data.email = await input({
			message: "Enter user's email:",
			validate: parseSchema(emailSchema),
		});
		data.role = await select({
			message: "Select user's role:",
			choices: Object.values(Role),
			default: Role.USER,
		});
		data.birthday = (await input({
			message: "Enter user's birthday:",
			validate: parseSchema(birthdaySchema),
		})) as unknown as Date;
		const password1 = await password({
			message: "Enter user's password:",
			mask: true,
			validate: parseSchema(passwordSchema),
		});

		await password({
			message: "Confirm password:",
			mask: true,
			validate: (value) => {
				if (value !== password1) return "Passwords do not match";
				return true;
			},
		});

		data.password = password1;

		const user = await this.userService.create(data);
		logger.info({ user });
	}
}
