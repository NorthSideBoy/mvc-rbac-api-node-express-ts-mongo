import { ApplicationErrorCode } from "../../enums/application-error-code.enum";
import { ApplicationError } from "../core/application-error";

export default class FileNotFoundError extends ApplicationError {
	constructor(message = "File not found.") {
		super(message, ApplicationErrorCode.FileNotFound);
	}
}
