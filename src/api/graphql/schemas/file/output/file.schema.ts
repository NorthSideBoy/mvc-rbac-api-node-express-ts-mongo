import { Field, ID, ObjectType } from "type-graphql";
import type { File } from "../../../../../DTOs/file/output/file.dto";
import type { FileVisibility } from "../../../../../enums/file-visibility.enum";
import type { Mimetype } from "../../../../../enums/mimetype.enum";

@ObjectType("File")
export default class FileGQL implements File {
	@Field(() => ID)
	id!: string;

	@Field()
	alt: string;

	@Field()
	filename: string;

	@Field()
	size: number;

	@Field()
	mimetype: Mimetype;

	@Field()
	path: string;

	@Field()
	url: string;

	@Field()
	ext: string;

	@Field()
	visibility: FileVisibility;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
