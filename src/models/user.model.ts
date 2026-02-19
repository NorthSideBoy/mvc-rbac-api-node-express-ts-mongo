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
import type { BeAnObject } from "@typegoose/typegoose/lib/types";
import type { Types } from "mongoose";
import paginatePlugin from "mongoose-paginate-v2";
import type { Search } from "../DTOs/operation/output/search.dto";
import {
	filterable,
	type PaginateModel,
	paginatedQueryPlugin,
	sorteable,
} from "../plugins/paginated-query.plugin";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";
import { Role } from "../rbac/role";
import type { User as UserTypes } from "../types/user.type";
import { hasher } from "../utils/hasher.util";

type UserModelType = ReturnModelType<typeof User, BeAnObject> &
	PaginateModel<User>;

@modelOptions({
	schemaOptions: { versionKey: false },
})
@pre<User>("save", async function () {
	const isHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
	if (!isHash.test(this.password))
		this.password = await hasher.encrypt(this.password);
})
@plugin(paginatePlugin)
@plugin(paginatedQueryPlugin, { createdAt: -1 })
@plugin(updatedAtPlugin)
export class User implements Base {
	_id!: Types.ObjectId;
	id!: string;

	@filterable()
	@sorteable()
	@prop({ required: true, trim: true })
	firstname: string;
	@filterable()
	@sorteable()
	@prop({ required: true, trim: true })
	lastname: string;

	@filterable()
	@sorteable()
	@prop({ required: true, trim: true, unique: true })
	username: string;

	@filterable()
	@sorteable()
	@prop({ required: true, trim: true, unique: true })
	email: string;

	@filterable()
	@sorteable()
	@prop({ default: Role.USER })
	role: Role;

	@prop({ required: true, trim: true })
	password: string;

	@filterable({ range: true })
	@sorteable()
	@prop({ required: true })
	birthday: Date;

	@filterable()
	@sorteable()
	@prop({ default: false })
	enable: boolean;

	@filterable({ range: true })
	@sorteable()
	@prop({ default: new Date() })
	createdAt: Date;

	@filterable()
	@sorteable()
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

	static async updatePassword(
		this: UserModelType,
		id: string,
		password: string,
	) {
		const hash = await hasher.encrypt(password);
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.updateOne({ _id: id }, { password: hash });
	}

	public static async search(
		this: UserModelType,
		input: UserTypes.Query,
	): Promise<Search<User>> {
		// biome-ignore lint: Need to keep 'this' context for plugin method
		const filters = this.buildFilters(input);

		// biome-ignore lint: Need to keep 'this' context for plugin methods
		const options = this.getPaginationOptions(input);

		// biome-ignore lint: paginate method from mongoose-paginate-v2
		const result = await this.paginate(filters, {
			page: options.page,
			limit: options.limit,
			sort: options.sort,
		});

		// biome-ignore lint: Need to keep 'this' context for plugin methods
		return this.formatQuery(result, options.page, options.limit);
	}
}

const UserModel = getModelForClass(User) as unknown as UserModelType;

export default UserModel;
