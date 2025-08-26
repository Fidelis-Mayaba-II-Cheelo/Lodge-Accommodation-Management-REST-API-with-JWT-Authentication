import csrf from 'csurf';


/**
 * ✅ CSRF Middleware
 * -------------------
 * This sets up the `csurf` middleware to:
 * - Use a cookie to store the CSRF secret for each user.
 * - When a request hits a protected POST/PUT/DELETE route,
 *   csurf checks that the request has a valid CSRF token.
 * - If missing or invalid, the request is rejected.
 * - This defends against malicious *cross-site* requests.
 */

const csrfProtection = csrf({
    cookie: {
        httpOnly: true, // ✅ Secret is stored in a cookie NOT accessible by JS → safer
        sameSite: 'Strict', // ✅ Blocks sending cookie from other sites → extra CSRF defense
        secure: process.env.NODE_ENV === 'production', // ✅ Only send cookie over HTTPS in prod
    },
});

// ✅ Export the middleware so you can use it *only* on routes you want protected.
const csrfMiddleware = csrfProtection;


/**
 * ✅ csrfTokenRoute
 * ------------------
 * This is a special route your frontend calls to get the CSRF token.
 * - csurf creates a unique CSRF token tied to the user's cookie.
 * - You send that token back as a *non-httpOnly* cookie so your frontend JS can read it.
 * - Your React app must then attach it to the `X-XSRF-TOKEN` header on protected requests.
 *
 * Why 2 cookies? ➜
 * - `httpOnly` cookie (secret) → server side only → safe
 * - `XSRF-TOKEN` (exposed) → frontend can read and send → needed to pass validation
 */
const csrfTokenRoute = (req, res) => {
    // ✅ Issue a CSRF token for this session/request
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false, // ✅ Must be readable by browser JS!
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production',
    });
    res.json({ message: 'CSRF token sent' }); // ✅ Helpful for debugging
};

export { csrfMiddleware, csrfTokenRoute };
