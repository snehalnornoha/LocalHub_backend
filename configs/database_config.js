import pg from 'pg';

const {Pool}  = pg;

export const pool = new Pool ({
 
    host : process.env.host_db,
    database: process.env.database_db,
    user :process.env.user_db,
    password :process.env.password_db,
    port :process.env.port_db,

});