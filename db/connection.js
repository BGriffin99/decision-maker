// PG database client/connection setup
const { Pool } = require('pg');

const dbParams = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const db = new Pool(dbParams);

db.connect(function(err){
  if (err) {
    console.log('Error establishing connection with database. ' + err);
  } else {
    console.log('Connection established with database');
  }
});

module.exports = db;
