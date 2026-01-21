import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',           // your PostgreSQL username
  host: 'localhost',          // your PostgreSQL host
  database: 'ai-study-assistant', // your database name
  password: 'admin',          // your PostgreSQL password
  port: 5432,                
});

export default pool;