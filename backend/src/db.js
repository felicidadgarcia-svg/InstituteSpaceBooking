import mysql from 'mysql2/promise';
import 'dotenv/config';
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME || 'institute_booking', user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', waitForConnections: true, connectionLimit: 10,
  queueLimit: 0, dateStrings: true, timezone: 'Z'
});
