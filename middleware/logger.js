// Import the winston logging library
import winston from 'winston';
// Adds daily log rotation feature to winston
import 'winston-daily-rotate-file';

// Destructure helper functions from winston.format for cleaner log formatting
const { combine, timestamp, printf, colorize } = winston.format;

// Define a custom log format for cleaner, readable logs
/*You want logs to be readable but also machine-parseable if you later integrate log analysis tools (like ELK stack, Datadog, etc.).*/
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Daily log rotation for general logs (info and above)
const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log', // Creates a new log file every day
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Compress old logs to save space
    maxSize: '20m', // Max size of a single log file
    maxFiles: '14d',  // Keep logs for 14 days
    level: 'info', // Captures logs of info level and above (warn, error)
});

// Separate transport for error logs
/*
Why Separate Error Logs?
Easy for alerting systems to monitor only error logs.
You don’t want to dig through 1,000 info logs to find 1 critical bug.
*/
const errorTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log', // Separate file for errors
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',  // Keep error logs for 30 days
    level: 'error', // Only log errors here
});

// Create the main logger instance
const logger = winston.createLogger({
    format: combine(
        timestamp(), // Adds timestamp to logs
        logFormat // Use our custom formatting
    ),
    transports: [
        transport, // Info logs
        errorTransport, // Error logs
    ],
});

// In development, also log to the console with color
/*
Why Different in Dev vs Prod?
In dev, you want quick visual feedback — console with colors helps.
In prod, you want silent logging to files for performance and auditing.
*/
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(), // Add colors to levels (info, error, etc.)
            timestamp(),
            logFormat
        ),
    }));
}

// Express middleware to log all incoming requests
/*
Why Use Middleware to Log Requests?
This captures every incoming HTTP request in the logs.
Super useful for tracing user behavior, debugging issues, or checking what routes are being hit.
*/
const loggerMiddleware = (req, res, next)=> {
    logger.info(`${req.method} ${req.url}`);
    next(); // Pass control to next middleware/route
}

// Export both the logger instance and the middleware function
export { logger, loggerMiddleware };
