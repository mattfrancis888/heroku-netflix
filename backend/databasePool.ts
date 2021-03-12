// const Pool = require('pg').Pool
import { Pool } from "pg";
// console.log("USER", process.env.elephantSQLUser);
// console.log("host", process.env.elephantSQLServer);
// console.log("database", process.env.elephantSQLDatabase);
// console.log("password", process.env.elephantSQLPassword);

console.log("USER", process.env.user);
console.log("database", process.env.database);
console.log("password", process.env.password);
const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: 5432,

    // user: process.env.elephantSQLUser,
    // host: process.env.elephantSQLServer,
    // database: process.env.elephantSQLDatabase,
    // password: process.env.elephantSQLPassword,
    // port: 5432,
});
pool.on("error", (err) => {
    // tslint:disable-next-line no-console
    console.error("PostgreSQL client generated error: ", err.message);
});
export default pool;
