const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '15092005',
  database: 'auth_app'
});

db.connect(err => {
  if (err) {
    console.log('DB error:', err);
  } else {
    console.log('MySQL connected');
  }
});

module.exports = db;
