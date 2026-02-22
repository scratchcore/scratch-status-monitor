import { createIsomorphicFn } from "@tanstack/react-start";
import pino from "pino";

const _logger = {
  prod: pino({
    name: "DEF",
  }),
  dev: pino({
    name: "DEF",
    transport: {
      target: "pino-pretty",
    },
  }),
};

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  level: LogLevel;
  name?: string;
}

const writeLog = ({ level, name = "DEF" }: LoggerOptions, msg: string, ...args: unknown[]) => {
  const target = process.env.NODE_ENV === "development" ? _logger.dev : _logger.prod;

  if (args.length === 0) {
    target[level]({ name }, msg);
    return;
  }

  target[level]({ name, data: args.length === 1 ? args[0] : args }, msg);
};

const logger = createIsomorphicFn().server(writeLog).client(writeLog);

// Usage anywhere in your app
export { logger };
