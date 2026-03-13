import path from "node:path";
import {
	getModelForClass,
	modelOptions,
	plugin,
	prop,
	type ReturnModelType,
} from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses";
import type { BeAnObject } from "@typegoose/typegoose/lib/types";
import type { Types } from "mongoose";
import { FileVisibility } from "../enums/file-visibility.enum";
import type { Mimetype } from "../enums/mimetype.enum";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";
import { url } from "../utils/url.util";

@modelOptions({
	schemaOptions: {
		versionKey: false,
	},
})
@plugin(updatedAtPlugin)
export class File implements Base {
	_id!: Types.ObjectId;
	id!: string;

	@prop({ required: true, trim: true })
	alt: string;

	@prop({ required: true, unique: true, trim: true })
	filename: string;

	@prop({ required: true })
	size: number;

	@prop({ required: true, trim: true })
	mimetype: Mimetype;

	@prop({ required: true, trim: true })
	ext: string;

	@prop({ required: true, trim: true })
	path: string;

	@prop({ required: true, default: FileVisibility.PUBLIC })
	visibility: FileVisibility;

	@prop({ default: new Date() })
	createdAt: Date;

	@prop({ default: new Date() })
	updatedAt: Date;

	public get url(): string {
		return url.from(path.join(this.path, this.filename));
	}

	public get serialize() {
		return {
			id: this.id,
			alt: this.alt,
			filename: this.filename,
			size: this.size,
			mimetype: this.mimetype,
			ext: this.ext,
			path: this.path,
			visibility: this.visibility,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}

	public get resource() {
		return { ...this.serialize, url: this.url };
	}

	static async findByFilename(
		this: ReturnModelType<typeof File, BeAnObject>,
		filename: string,
	) {
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.findOne({ filename });
	}

	getAbsolutePath(): string {
		return path.join(process.cwd(), "storage", this.path);
	}
}

const FileModel = getModelForClass(File);

export default FileModel;
