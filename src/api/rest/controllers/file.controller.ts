import {
	Body,
	Controller,
	Post,
	Response,
	Route,
	SuccessResponse,
	Tags,
} from "tsoa";
import type CreateFile from "../../../DTOs/file/input/create-file.dto";
import type File from "../../../DTOs/file/output/file.dto";

@Route("files")
@Tags("Files")
export class FileController extends Controller {
	/**
	 * @summary Upload file
	 */
	@Post("/upload")
	@SuccessResponse(200)
	@Response(400, "BadRequest")
	@Response(409, "Conflict")
	@Response(422, "UnprocessableEntity")
	@Response(429, "TooManyRequests")
	@Response(500, "InternalServerError")
	async upload(@Body() body: CreateFile): Promise<File> {
		console.log("prueba");
		return {} as File;
	}
}
