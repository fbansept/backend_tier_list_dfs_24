const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tier_list_dfs_24",
  connectionLimit: 10,
});

app.get("/test", (req, res) => {

  
  connection.query(
    ` SELECT url, i.id AS id_image, id_categorie, nom
    FROM image i
    JOIN categorie c ON i.id_categorie = c.id
    WHERE c.id_utilisateur = 1`,
    (err, rows) => {
      if (err) throw err;

      res.send(JSON.stringify(rows));
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port} !!!!!!`);
});
