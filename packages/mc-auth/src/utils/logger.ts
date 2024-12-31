import { Context } from 'hono';

export type LogLevel = "info" | "success" | "warn" | "error" | "debug";

export const levels = ["info", "success", "warn", "error", "debug"] as const;

export function shouldPublishLog(
	currentLogLevel: LogLevel,
	logLevel: LogLevel,
): boolean {
	return levels.indexOf(logLevel) <= levels.indexOf(currentLogLevel);
}

export interface Logger {
	disabled?: boolean;
	level?: Exclude<LogLevel, "success">;
	log?: (
		level: Exclude<LogLevel, "success">,
		message: string,
		...args: any[]
	) => void;
}

export type LogHandlerParams = Parameters<NonNullable<Logger["log"]>> extends [
	LogLevel,
	...infer Rest,
]
	? Rest
	: never;

const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	underscore: "\x1b[4m",
	blink: "\x1b[5m",
	reverse: "\x1b[7m",
	hidden: "\x1b[8m",
	fg: {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",
	},
	bg: {
		black: "\x1b[40m",
		red: "\x1b[41m",
		green: "\x1b[42m",
		yellow: "\x1b[43m",
		blue: "\x1b[44m",
		magenta: "\x1b[45m",
		cyan: "\x1b[46m",
		white: "\x1b[47m",
	},
};

const levelColors: Record<LogLevel, string> = {
	info: colors.fg.blue,
	success: colors.fg.green,
	warn: colors.fg.yellow,
	error: colors.fg.red,
	debug: colors.fg.magenta,
};

const formatMessage = (level: LogLevel, message: string, c?: Context): string => {
	const timestamp = new Date().toISOString();
	const path = c ? ` ${colors.dim}${c.req.path}${colors.reset}` : '';
	return `${colors.dim}${timestamp}${colors.reset} ${
		levelColors[level]
	}${level.toUpperCase()}${colors.reset} ${colors.fg.cyan}mc-auth${
		colors.reset
	}${path} ${message}`;
};

export const honoLogger = (message: string, ...rest: any[]) => {
	const context = rest.find(arg => arg?.req?.path !== undefined);
	const otherArgs = rest.filter(arg => arg?.req?.path === undefined);

	mcLogger.info(message, context, ...otherArgs);
}

export const createLogger = (
	options?: Logger,
): Record<LogLevel, (...params: LogHandlerParams) => void> => {
	const enabled = options?.disabled !== true;
	const logLevel = options?.level ?? "error";

	const LogFunc = (
		level: LogLevel,
		message: string,
		args: any[] = [],
	): void => {
		if (!enabled || !shouldPublishLog(logLevel, level)) {
			return;
		}

		const context = args.find(arg => arg?.req?.path !== undefined);
		const otherArgs = args.filter(arg => arg?.req?.path === undefined);

		const formattedMessage = formatMessage(level, message, context);

		if (!options || typeof options.log !== "function") {
			if (level === "error") {
				console.error(formattedMessage, ...otherArgs);
			} else if (level === "warn") {
				console.warn(formattedMessage, ...otherArgs);
			} else {
				console.log(formattedMessage, ...otherArgs);
			}
			return;
		}

		options.log(
			level === "success" ? "info" : level,
			formattedMessage,
			...otherArgs,
		);
	};

	return Object.fromEntries(
		levels.map((level) => [
			level,
			(...[message, ...args]: LogHandlerParams) =>
				LogFunc(level, message, args),
		]),
	) as Record<LogLevel, (...params: LogHandlerParams) => void>;
};

export const mcLogger = createLogger();
