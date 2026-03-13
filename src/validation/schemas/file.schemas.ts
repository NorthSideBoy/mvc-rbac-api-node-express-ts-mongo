import z from "zod";
import { FileVisibility } from "../../enums/file-visibility.enum";
import { Mimetype } from "../../enums/mimetype.enum";

export const altSchema = z.string().min(1).max(255);

export const filenameSchema = z.string().min(1).max(255);

export const sizeSchema = z.number().max(2 * 1024 * 1024);

export const mimetypeSchema = z.enum(Mimetype);

export const extSchema = z.string().min(1).max(10);

export const pathSchema = z
	.string()
	.min(1)
	.max(512)
	.regex(/^[a-zA-Z0-9\-_./\\]+$/);

export const visibilitySchema = z.enum(FileVisibility);
