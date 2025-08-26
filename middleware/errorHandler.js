//Centralized Error Handling Middleware (Use our central logger)
import { logger } from './logger.js';

// Global error-handling middleware for Express
const errorHandler = (err, req, res, next) => {
    // Log the error with method, route, and user IP
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);

    //Get the status code of the error
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Respond with a generic error response
    res.status(statusCode).json({
        message: 'Internal Server Error',
        customMessage: err.customMessage,
        // Only show error details if NOT in production
        error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
}

export { errorHandler };

/*
Why Central Error Handling?
Prevents the need for repetitive try-catch logging in every route.
Clean separation of concerns: routes handle logic; middleware handles errors.
Automatically captures any uncaught errors and logs them reliably.
Keeps error messages safe in production to avoid leaking internals.
*/
