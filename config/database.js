import mysql from 'mysql';
import { config } from "dotenv";

config({
    path: "./config.env",
})

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'inventory',
});



export default connection; 