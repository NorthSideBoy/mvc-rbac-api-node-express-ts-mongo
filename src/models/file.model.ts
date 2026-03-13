import path from "node:path";
import {
	getModelForClass,
	modelOptions,
	plugin,
	prop,
	type ReturnModelType,
} from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses";
import type { BeAnObject, DocumentType } from "@typegoose/typegoose/lib/types";
import { Expose } from "class-transformer";
import type { Types } from "mongoose";
import type { File as DTO } from "../DTOs/file/output/file.dto";
import { FileVisibility } from "../enums/file-visibility.enum";
import type { Mimetype } from "../enums/mimetype.enum";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";
import { mapper } from "../utils/mapper.util";
import { url } from "../utils/url.util";
import { decode } from "../utils/validator.util";
import { fileCodec } from "../validation/codecs/file/output/file.codec";

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
@plugin(updatedAtPlugin)
export class File implements Base {
	_id!: Types.ObjectId;

	@Expose()
	id!: string;

	@Expose()
	@prop({ required: true, trim: true })
	alt: string;

	@Expose()
	@prop({ required: true, unique: true, trim: true })
	filename: string;

	@Expose()
	@prop({ required: true })
	size: number;

	@Expose()
	@prop({ required: true, trim: true })
	mimetype: Mimetype;

	@Expose()
	@prop({ required: true, trim: true })
	ext: string;

	@Expose()
	@prop({ required: true, trim: true })
	path: string;

	@Expose()
	@prop({ required: true, default: FileVisibility.PUBLIC })
	visibility: FileVisibility;

	@Expose()
	@prop({ default: new Date() })
	createdAt: Date;

	@Expose()
	@prop({ default: new Date() })
	updatedAt: Date;

	@Expose()
	public get url(): string {
		return url.from(path.join(this.path, this.filename));
	}

	public dto(this: DocumentType<File, BeAnObject>): DTO {
		const plain = mapper.fromDocument<File>(File, this);
		return decode<DTO>(fileCodec, plain);
	}

	static async findByFilename(
		this: ReturnModelType<typeof File, BeAnObject>,
		filename: string,
	) {
		// biome-ignore lint: Mongoose return type handled by Typegoose
		return await this.findOne({ filename });
	}

	public get absolutePath(): string {
		return path.join(process.cwd(), "storage", this.path);
	}
}

const FileModel = getModelForClass(File);

export default FileModel;
