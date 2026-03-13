import {
	type DocumentType,
	getModelForClass,
	modelOptions,
	plugin,
	pre,
	prop,
	type ReturnModelType,
} from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses";
import type { BeAnObject, Ref } from "@typegoose/typegoose/lib/types";
import { Expose, Type } from "class-transformer";
import { type Filter, ObjectId } from "mongodb";
import type { PaginateOptions, Types } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import paginatePlugin from "mongoose-paginate-v2";
import type { User as DTO } from "../DTOs/user/output/user.dto";
import { Role } from "../enums/role.enum";
import {
	filterable,
	type PaginateModel,
	paginatedQueryPlugin,
	sorteable,
} from "../plugins/paginated-query.plugin";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";
import type Search from "../types/search.type";
import type { Token } from "../types/token.type";
import { hasher } from "../utils/hasher.util";
import { mapper } from "../utils/mapper.util";
import { decode } from "../utils/validator.util";
import { userCodec } from "../validation/codecs/user/output/user.codec";
import { File } from "./file.model";

type UserModelType = ReturnModelType<typeof User, BeAnObject> &
	PaginateModel<User>;

@modelOptions({
	schemaOptions: {
		versionKey: false,
		toJSON: {
			virtuals: true,
			getters: true,
		},
		toObject: {
			virtuals: true,
			getters: true,
		},
	},
})
@pre<User>("save", async function () {
	const isHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
	if (!isHash.test(this.password))
		this.password = await hasher.encrypt(this.password);
})
@plugin(paginatePlugin)
@plugin(paginatedQueryPlugin, { createdAt: -1 })
@plugin(updatedAtPlugin)
@plugin(mongooseAutoPopulate)
export class User implements Base {
	_id!: Types.ObjectId;

	@Expose()
	id!: string;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ required: true, trim: true })
	firstname: string;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ required: true, trim: true })
	lastname: string;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ required: true, trim: true, unique: true })
	username: string;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ required: true, trim: true, unique: true })
	email: string;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ default: Role.USER })
	role: Role;

	@Expose()
	@Type(() => File)
	@prop({ ref: () => File, required: true, autopopulate: true })
	picture: Ref<File>;

	@prop({ required: true, trim: true })
	password: string;

	@Expose()
	@filterable({ range: true })
	@sorteable()
	@prop({ required: true })
	birthday: Date;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ default: false })
	enable: boolean;

	@Expose()
	@filterable({ range: true })
	@sorteable()
	@prop({ default: new Date() })
	createdAt: Date;

	@Expose()
	@filterable()
	@sorteable()
	@prop({ default: new Date() })
	updatedAt: Date;

	public dto(this: DocumentType<User, BeAnObject>): DTO {
		const plain = mapper.fromDocument<User>(User, this);
		return decode<DTO>(userCodec, plain);
	}

	public get sign(): Token.Sign {
		return {
			sub: this.id,
			username: this.username,
			role: this.role,
			enable: this.enable,
		};
	}

	public async comparePassword(
		this: DocumentType<User, BeAnObject>,
		plain: string,
	): Promise<boolean> {
		return await hasher.compare(plain, this.password);
	}

	static async findByEmail(this: UserModelType, email: string) {
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.findOne({ email });
	}

	static async findByUsername(this: UserModelType, username: string) {
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.findOne({ username });
	}

	static async findOneByRole(this: UserModelType, role: Role) {
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.findOne({ role });
	}

	public static async search(
		this: UserModelType,
		input: Filter<User> & PaginateOptions,
	): Promise<Search<DocumentType<User>>> {
		// biome-ignore lint: Need to keep 'this' context for plugin method
		const filters = this.buildFilters(input);

		// biome-ignore lint: Need to keep 'this' context for plugin methods
		const options = this.getPaginationOptions(input);

		// biome-ignore lint: paginate method from mongoose-paginate-v2
		const result = await this.paginate(filters, {
			...options,
			lean: false,
		});

		// biome-ignore lint: Need to keep 'this' context for plugin methods
		return this.formatQuery(result, options.page, options.limit);
	}

	static async updatePassword(
		this: UserModelType,
		id: string,
		password: string,
	) {
		const hash = await hasher.encrypt(password);

		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.updateOne({ _id: id }, { password: hash });
	}

	static async isUsernameAvailable(
		this: UserModelType,
		username: string,
		id?: string,
	): Promise<boolean> {
		const query: Filter<User> = { username };
		if (id) query._id = { $ne: ObjectId.createFromHexString(id) };

		// biome-ignore lint: Mongoose return type handled by Typegoose
		const exists = await this.exists(query);
		return exists === null;
	}

	static async isEmailAvailable(
		this: UserModelType,
		email: string,
		id?: string,
	): Promise<boolean> {
		const query: Filter<User> = { email };
		if (id) query._id = { $ne: ObjectId.createFromHexString(id) };

		// biome-ignore lint: Mongoose return type handled by Typegoose
		const exists = await this.exists(query);
		return exists === null;
	}
}

const UserModel = getModelForClass(User) as unknown as UserModelType;

export default UserModel;
