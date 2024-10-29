const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "tier_list_dfs_24",
  connectionLimit: 10,
});

app.post("/login", (req, res) => {
  const utilisateur = req.body;

  connection.execute(
    `SELECT id
    FROM utilisateur u
    WHERE u.email = ?
    AND u.password = ?`,
    [utilisateur.email, utilisateur.password],
    (err, rows) => {
      if (err) throw err;

      //si l'utilisateur n'a pas été trouvé
      if (rows.length == 0) {
        res.status(403).send();
      } else {
        res.status(200).send();
      }
    }
  );
});

app.get("/categories", (req, res) => {
  connection.query(
    ` SELECT url, i.id AS id_image, c.id as id_categorie, nom AS nom_categorie
    FROM image i
    RIGHT JOIN categorie c ON i.id_categorie = c.id
    WHERE c.id_utilisateur = 1`,
    (err, rows) => {
      if (err) throw err;

      // //solution 1 :

      // //on réalise une structure différente du résultat :
      // // un tableau avec des objet possédant le nom de la catégorie et les images liées
      // const groupeParCategorie = {};

      // //on parcours toutes les lignes du résultat de la requete (qui contienneny chaque images)
      // for (let image of rows) {
      //   //si la catégorie de l'image n'a pas encore été ajoutée, on l'ajoute,
      //   // sinon on ajoute seulement l'image dans sa liste d'images
      //   if (groupeParCategorie[image.nom_categorie]) {
      //     groupeParCategorie[image.nom_categorie].images.push(image.url);
      //   } else {
      //     groupeParCategorie[image.nom_categorie] = {
      //       id: image.id_categorie,
      //       nom: image.nom_categorie,
      //       images: image.url ? [image.url] : [],
      //     };
      //   }
      // }

      // //on transforme en tableau l'objet qui nous a servis
      // // à regrouper les images par catégorie
      // const categories = [];

      // //on parcours tous les noms des propriétés de l'objet qui regroupe les image par catégiorie
      // for (let nomCategorie in groupeParCategorie) {
      //   categories.push(groupeParCategorie[nomCategorie]);
      // }

      // res.send(JSON.stringify(categories));

      //solution 2 :

      const categories = rows.reduce((accumulateur, image) => {
        //si on trouve la catégorie on ajoute l'image à cette c&tégorie,
        //sinon on ajoute un nouvel objet au tableau

        const categorieExistante = accumulateur.filter(
          (categorie) => categorie.nom == image.nom_categorie
        );

        if (categorieExistante.length >= 1) {
          categorieExistante[0].images.push(image.url);
        } else {
          accumulateur.push({
            nom: image.nom_categorie,
            id: image.id_categorie,
            images: image.url ? [image.url] : [],
          });
        }

        return accumulateur;
      }, []);

      res.send(JSON.stringify(categories));
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port} !!!!!!`);
});
