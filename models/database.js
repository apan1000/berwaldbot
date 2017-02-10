const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/chatbot';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
    'CREATE TABLE users(user_id VARCHAR(256) PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50) nickname VARCHAR(80))'
    ).then(() => { client.end(); });