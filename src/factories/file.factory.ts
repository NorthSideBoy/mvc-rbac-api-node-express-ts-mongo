type CreateFileOptions = Omit<FilePropertyBag, "type"> &
	Pick<Required<FilePropertyBag>, "type">;

export function createFile(
	buffer: Buffer,
	filename: string,
	options: CreateFileOptions,
): File {
	if (!options.lastModified) options.lastModified = Date.now();
	const uint8Array = new Uint8Array(buffer);
	return new File([uint8Array], filename, options);
}
