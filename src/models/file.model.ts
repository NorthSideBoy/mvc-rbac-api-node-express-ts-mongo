import { getModelForClass, plugin, prop } from "@typegoose/typegoose";
import type { Base } from "@typegoose/typegoose/lib/defaultClasses";
import type { Types } from "mongoose";
import type { Mimetype } from "../enums/mimetype.enum";
import { updatedAtPlugin } from "../plugins/updated-at.plugin";

@plugin(updatedAtPlugin)
export class File implements Base {
	_id!: Types.ObjectId;
	id!: string;

	@prop({ required: true, unique: true, trim: true })
	name: string;

	@prop({ required: true, unique: true, trim: true })
	filename: string;

	@prop({ required: true })
	size: number;

	@prop({ required: true, trim: true })
	mimetype: Mimetype;

	@prop({ required: true, trim: true })
	ext: string;

	@prop({ default: new Date() })
	createdAt: Date;

	@prop({ default: new Date() })
	updatedAt: Date;
}

const FileModel = getModelForClass(File);

export default FileModel;
