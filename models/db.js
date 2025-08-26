import { Pool } from 'pg';

const db = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOSTNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

export default db;