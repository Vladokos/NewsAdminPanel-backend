const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const cors = require("cors");

const app = express();
const jsonParser = express.json();

const middleware = require("./middleware");

const mysql = require("mysql2");

middleware(app, cors, express, path);

const connection = mysql.createConnection({
  host: "sql8.freesqldatabase.com",
  port: 3306,
  user: "sql8603073",
  password: "5Xrs7gWjSt",
  database: "sql8603073",
});

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "" + file.originalname);
  },
});
const upload = multer({ storage: storageConfig }).single("image");

app.post("/article", (req, res) => {
  connection.query("SELECT * FROM `ARTICLE`", (errors, results, fields) => {
    return res.send(results).status(200);
  });
});

app.post("/article/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM `ARTICLE` WHERE `id` = " + id,
    (errors, results, fields) => {
      return res.send(results).status(200);
    }
  );
});

app.post("/articleAdd", jsonParser, (req, res) => {
  if (!req.body) res.sendStatus(400);

  const category = req.body.category;
  const title = req.body.titles;
  const text = req.body.texts;

  connection.query(
    "INSERT INTO `ARTICLE` (`category`,`title`,`text`) VALUES(" +
      `'${category}','${title}','${text}')`,
    (errors, results, fields) => {
      return res.json({ id: results.insertId }).status(200);
    }
  );
});

app.put("/image", upload, (req, res) => {
  if (req.file === undefined) {
    res.sendStatus(200);
    return console.log("req.file is undefined");
  }

  const id = req.body.id;
  const image = req.file.filename;
  const oldImage = req.body.oldImage;

  sharp(image)
    .resize(320, 240)
    .toFile("./uploads/" + image, (err) => {
      if (err) throw err;
      fs.unlinkSync(image);
      if (oldImage.length > 0) {
        fs.access("./uploads/" + oldImage, fs.F_OK, (notFound) => {
          if (notFound) {
            console.log("file not found");
            return null;
          }
          fs.unlinkSync("./uploads/" + oldImage);
        });
      }
    });
  connection.query(
    "UPDATE `ARTICLE` SET `image` = " + `'${image}' WHERE id = '${id}'`,
    (error, results, fields) => {
      return res.sendStatus(200);
    }
  );
});

app.put("/article", jsonParser, (req, res) => {
  if (!req.body) res.sendStatus(400);

  const id = req.body.id;
  const title = req.body.titles;
  const category = req.body.category;
  const text = req.body.texts;

  connection.query(
    `UPDATE ARTICLE SET title = '${title}', category = '${category}', text = '${text}'
    WHERE id = ${id}`,
    (error, results, fields) => {
      return res.sendStatus(200);
    }
  );
});

app.delete("/article/:id", jsonParser, (req, res) => {
  const id = req.params.id;
  const image = req.body.image;

  fs.access("./uploads/" + image, fs.F_OK, (notFound) => {
    if (notFound) {
      return null;
    }
    fs.unlinkSync("./uploads/" + image);
  });

  connection.query(
    `DELETE FROM ARTICLE WHERE id = ${id}`,
    (errors, results, fields) => {
      return res.sendStatus(200);
    }
  );
});

app.listen(5000, () => {
  console.log("Servr is running");
});
