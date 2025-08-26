🏨 Lodge Accommodation Management REST API with JWT Authentication

Welcome to this repository!

This project is a secure, production-ready REST API backend for managing lodge accommodation services. Built with Node.js and Express.js, it follows a layered (MVC-style) architecture to ensure maintainability, scalability, and clean separation of concerns.

It implements JWT authentication, CSRF protection, rate limiting, centralized logging, file uploads to AWS S3, and robust input validation using express-validator—demonstrating modern backend best practices.

🚀 What This Project Does

Securely handles user registration and authentication with JWT

Manages lodge accommodations, rooms, and bedspaces dynamically

Allows image uploads to AWS S3 for lodging assets

Centralized logging with Winston and daily log rotation

Implements security best practices: CORS, CSRF protection, rate limiting, Helmet headers

Validates all incoming requests and handles errors gracefully

🧠 Skills & Technologies

💻 Languages: JavaScript, SQL
🔗 Frameworks & Libraries: Node.js, Express.js, Passport.js (Google OAuth 2.0)
🗄 Databases: PostgreSQL
🔒 Security: JWT, bcrypt, csurf, express-rate-limit, Helmet
📦 File Handling: Multer, AWS S3
🛠 Tools: Git, Nodemon, Postman
📊 Logging: Winston, winston-daily-rotate-file
