// ✅ Helmet helps set secure HTTP headers automatically.
// Here, we're customizing the Content Security Policy (CSP)
// to tightly control what external scripts, styles, fonts, images, etc.
// your frontend is allowed to load/run.

/*
If you ever see a CSP violation error in the browser console, it’ll say:
Refused to load the script at ... because it violates the Content Security Policy.
That tells you which domain you forgot to add.
* */

const directives = {
    // 🔒 default-src: fallback for all types if no more specific rule matches
    "default-src": ["'self'"], // Only allow same-origin by default

    // 🔒 script-src: what JS files the browser can run
    // 'self' = your own backend
    // + Stripe’s official JS SDK (required for secure payments)
    // + Paystack’s SDK or other mobile money scripts
    "script-src": [
        "'self'",
        "https://js.stripe.com",
        "https://js.paystack.co", // Replace or add other payment providers as needed
    ],

    // 🔒 style-src: what CSS stylesheets can be loaded
    // 'self' means your local styles.
    // 'https:' means trusted CDNs like Google Fonts CSS if you use them.
    "style-src": [
        "'self'",
        "https:",
    ],

    // 🔒 font-src: where fonts can be loaded from
    // Google Fonts serve fonts from fonts.gstatic.com
    "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
    ],

    // 🔒 img-src: where images can be loaded from
    // 'self' = your own API serves images
    // 'data:' = allow base64 inline images
    // + add your external image storage if using S3, Cloudinary, etc.
    "img-src": [
        "'self'",
        "data:",
        "https://your-bucket.s3.amazonaws.com", // e.g. AWS S3 bucket or Cloudinary
    ],

    // 🔒 connect-src: what APIs and websockets the browser can talk to
    // 'self' = your Express API
    // localhost:3000 = your React dev server for local dev
    // Stripe & Paystack APIs for payment requests
    "connect-src": [
        "'self'",
        "http://localhost:3000", // React dev server during development
        "https://api.stripe.com",
        "https://api.paystack.co", // or your mobile money API endpoint
    ],

    // 🔒 object-src: disable loading <object>, <embed>, <applet>
    // Good practice to block these entirely.
    "object-src": ["'none'"],

    // 🔒 upgrade-insecure-requests: automatically upgrade HTTP to HTTPS
    // when possible (optional, but good for mixed content)
    "upgrade-insecure-requests": [],
}

export {directives};