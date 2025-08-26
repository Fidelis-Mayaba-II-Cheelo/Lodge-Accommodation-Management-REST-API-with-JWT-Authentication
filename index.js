import express from 'express';
import {loggerMiddleware} from './middleware/logger.js';
import {notFound} from './middleware/notFound.js';
import {errorHandler} from './middleware/errorHandler.js';
import accounts from './routes/accounts.js';
import hostels from './routes/hostels.js';
import adminNotifications from "./routes/adminNotifications.js";
import path from 'path';
import url from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {csrfTokenRoute} from "./middleware/csrfHandler.js";
import {directives} from './middleware/cspDirectives.js';


//Initialize express
const app = express();

//Initialize our port
const PORT = process.env.PORT || 9000;

//Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

//Our Cors Middleware
app.use(cors({
    origin: true, //This is just for dev mode. In production provide the frontend route i.e. 'http://localhost:3000'.
    credentials: true
}));

//Our helmet middleware for preventing XSS attacks
app.use(helmet({
    contentSecurityPolicy: {
        //useDefaults applies Helmet's default CSP rules
        useDefaults: true,
        //directives: your custom fine-tuned rules
        directives: directives
    },
}));

//Our Cookie Parser middleware
app.use(cookieParser());

//Exposing our csrf token to the frontend
app.get('/api/csrf-token', csrfTokenRoute);

//Setup our static folder
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

//Our custom logger middleware
app.use(loggerMiddleware);


//Routes
app.use('/api/accounts', accounts);
app.use('/api/hostels', hostels);
app.use('/api/adminNotifications', adminNotifications);

//Catch-all 404 handler for unknown routes
app.use(notFound);

//Our Error handler middleware
app.use(errorHandler);



app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});