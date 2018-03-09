// DB Connection
const mysql = require("mysql");

const con = mysql.createConnection({
    port: process.env.MYSQL_PORT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
});

con.connect((err) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log(`connected to DB: ${process.env.MYSQL_DB}`);
});

module.exports = con;