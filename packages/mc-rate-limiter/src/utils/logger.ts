interface LoggerOptions {
  enableDebug?: boolean;
  prefix?: string;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[95m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  },
};

export const logger = (options: LoggerOptions = {}) => {
  const enableDebug = options.enableDebug ?? false;
  const prefix = options.prefix ?? '[mc-rate-limiter]';

  const formatPrefix = (): string => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${colors.dim}${timestamp}${colors.reset} ${colors.fg.magenta} ${prefix}${colors.reset}`;
  };

  return {
    error(message: string, error?: unknown) {
      console.error(`${formatPrefix()} ❌ ${message}`, error || '');
    },

    warn(message: string) {
      console.warn(`${formatPrefix()} ⚠️ ${message}`);
    },

    info(message: string) {
      console.log(`${formatPrefix()} ℹ️ ${message}`);
    },

    debug(message: string) {
      if (enableDebug) {
        console.log(`${formatPrefix()} 🔍 ${message}`);
      }
    },

    success(message: string) {
      console.log(`${formatPrefix()} ✅ ${message}`);
    },

    isDebugEnabled() {
      return enableDebug;
    },
  };
};

export type Logger = ReturnType<typeof logger>;
