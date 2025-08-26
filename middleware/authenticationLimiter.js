import rateLimit from 'express-rate-limit';

const authenticationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Wait 15 minutes to get another attempt
    max: 5,                   // allow max 5 requests per window per IP
    message: 'Too many attempts, please wait 15 mins before trying again.',
    standardHeaders: true,    // adds RateLimit-* headers
    legacyHeaders: false,     // disables deprecated X-RateLimit-* headers
})

export {authenticationLimiter};