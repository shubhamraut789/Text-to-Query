const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path'); 
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shubham',
    database: 'texttoquery'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.json());

app.post('/query', (req, res) => {
  const sqlQuery = req.body.query;

  if (!sqlQuery) {
      return res.status(400).json({ error: 'No query provided' });
  }

  db.query(sqlQuery, (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Error executing query' });
      }

      const filePath = path.join(__dirname, 'public', 'results.csv');
      const ws = fs.createWriteStream(filePath);

      fastcsv
          .write(results, { headers: true })
          .pipe(ws)
          .on('finish', () => {
              res.json({ downloadLink: '/results.csv' });
          });
  });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
