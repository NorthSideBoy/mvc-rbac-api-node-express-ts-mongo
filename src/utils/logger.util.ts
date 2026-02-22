import pino, {
	type Bindings,
	type ChildLoggerOptions,
	type LoggerOptions,
	type Logger as PinoLogger,
} from "pino";
import { env } from "../configs/env.config";

const isDev = env.NODE_ENV === "development";

const baseOptions: LoggerOptions = {
	level: env.LOG_LEVEL,
	...(isDev
		? {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss.l",
						ignore: "pid,hostname",
					},
				},
			}
		: {}),
};

export class Logger {
	private readonly base: PinoLogger;

	constructor(options: LoggerOptions = baseOptions) {
		this.base = pino(options);
	}

	info(...args: Parameters<PinoLogger["info"]>) {
		return this.base.info(...args);
	}

	error(...args: Parameters<PinoLogger["error"]>) {
		return this.base.error(...args);
	}

	warn(...args: Parameters<PinoLogger["warn"]>) {
		return this.base.warn(...args);
	}

	debug(...args: Parameters<PinoLogger["debug"]>) {
		return this.base.debug(...args);
	}

	fatal(...args: Parameters<PinoLogger["fatal"]>) {
		return this.base.fatal(...args);
	}

	trace(...args: Parameters<PinoLogger["trace"]>) {
		return this.base.trace(...args);
	}

	child(bindings: Bindings, options?: ChildLoggerOptions) {
		return this.base.child(bindings, options);
	}

	// NUEVOS MÉTODOS PARA CONTROL DE NIVEL
	setLevel(level: string) {
		this.base.level = level;
	}

	getLevel(): string {
		return this.base.level;
	}

	get raw(): PinoLogger {
		return this.base;
	}
}

export const logger = new Logger();
