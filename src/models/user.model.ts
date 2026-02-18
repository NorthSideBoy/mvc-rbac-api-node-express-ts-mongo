import {
	type DocumentType,
	getModelForClass,
	modelOptions,
	plugin,
	pre,
	prop,
	type ReturnModelType,
} from "@typegoose/typegoose";
import { type Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import type { BeAnObject } from "@typegoose/typegoose/lib/types";
import type { Types } from "mongoose";
import paginatePlugin from "mongoose-paginate-v2";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";
import { Role } from "../rbac/role";
import type { User as UserTypes } from "../types/user.type";
import { hasher } from "../utils/hasher.util";

@modelOptions({
	schemaOptions: {
		versionKey: false,
	},
})
@pre<User>("save", async function () {
	const isHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
	if (!isHash.test(this.password))
		this.password = await hasher.encrypt(this.password);
})
@plugin(paginatePlugin)
@plugin(updatedAtPlugin)
export class User extends TimeStamps implements Base {
	_id!: Types.ObjectId;

	id!: string;

	@prop({ required: true, trim: true })
	firstname: string;

	@prop({ required: true, trim: true })
	lastname: string;

	@prop({ required: true, trim: true, unique: true })
	username: string;

	@prop({ required: true, trim: true, unique: true })
	email: string;

	@prop({ default: Role.USER })
	role: Role;

	@prop({ required: true, trim: true })
	password: string;

	@prop({ required: true })
	birthday: Date;

	@prop({ default: false })
	enable: boolean;

	@prop({ default: new Date() })
	createdAt: Date;

	@prop({ default: new Date() })
	updatedAt: Date;

	public get plain(): UserTypes.Schema {
		return {
			id: this.id,
			firstname: this.firstname,
			lastname: this.lastname,
			username: this.username,
			email: this.email,
			role: this.role,
			password: this.password,
			birthday: this.birthday,
			enable: this.enable,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public get secure(): UserTypes.Secure {
		const { password, ...secure } = this.plain;
		return secure;
	}

	static async findByEmail(
		this: ReturnModelType<typeof User, BeAnObject>,
		email: string,
	) {
		// biome-ignore lint: Mongoose needs to type 'this'
		return await this.findOne({ email });
	}

	static async findByUsername(
		this: ReturnModelType<typeof User, BeAnObject>,
		username: string,
	) {
		// biome-ignore lint: Mongoose needs to type 'this'
		return await this.findOne({ username });
	}

	static async findOneByRole(
		this: ReturnModelType<typeof User, BeAnObject>,
		role: Role,
	) {
		// biome-ignore lint: Mongoose needs to type 'this'
		const user = await this.findOne({ role });
		return user;
	}

	static async updatePassword(
		this: ReturnModelType<typeof User, BeAnObject>,
		id: string,
		password: string,
	) {
		const hash = await hasher.encrypt(password);
		// biome-ignore lint: Mongoose needs to type 'this'
		return await this.updateOne({ _id: id }, { password: hash });
	}

	public async comparePassword(
		this: DocumentType<User, BeAnObject>,
		plain: string,
	): Promise<boolean> {
		return await hasher.compare(plain, this.password);
	}
}

const UserModel = getModelForClass(User);

export default UserModel;
