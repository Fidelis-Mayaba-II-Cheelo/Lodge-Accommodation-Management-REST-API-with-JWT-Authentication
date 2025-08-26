import jwt from 'jsonwebtoken';
/**
 * ✅ verifyJWT Middleware
 * ------------------------
 * This middleware checks:
 * 1️⃣ If the request has an `Authorization` header that starts with `Bearer `
 * 2️⃣ If so, it extracts the token from the header.
 * 3️⃣ It verifies the token signature and expiry with our secret key.
 * 4️⃣ If valid, the decoded payload is attached to `req.user` for later use.
 * 5️⃣ If missing or invalid, respond with 401 (Unauthorized) or 403 (Forbidden).
 *
 * This protects routes by requiring the client to send a valid JWT access token.
 */

const verifyJWT = (req, res, next) => {

    // ✅ Get the Authorization header (e.g., "Bearer eyJhbGciOiJIUzI1...")
    const authHeader = req.headers['authorization'];

    // ✅ If missing or malformed, deny access (no token = unauthorized)
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

    // ✅ Extract only the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // ✅ Verify the token using the same secret we signed it with
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        //Token invalid or expired = Forbidden
        if (err) return res.sendStatus(403);
        // ✅ Save decoded user data (e.g., `{ id, role }`) for later middlewares/controllers
        req.user = decoded;
        // ✅ Token is valid → Continue to next handler
        next();
    });
};

/**
 * ✅ requireRole Middleware
 * --------------------------
 * This is a *higher-order function* that returns a middleware.
 * It checks that the `req.user` (set by `verifyJWT`) has the required `role`.
 *
 * If not, it responds with 403 Forbidden.
 *
 * Example: `requireRole('admin')` only lets users with `role: 'admin'` pass.
 */
const requireRole = (role) => (req, res, next) => {
    // ✅ If user's role does not match, deny access
    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    // ✅ Role matches → Continue to next handler
    next();
};

export { verifyJWT, requireRole };
