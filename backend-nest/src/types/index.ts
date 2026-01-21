import { Client } from 'pg';

export async function testDbConnection() {
  const client = new Client({
    host: 'localhost',      
    port: 5432,             
    user: 'postgres',  
    password: 'admin', 
    database: 'ai-study-assistant',
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    console.log('Database connected successfully');
    await client.end();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
