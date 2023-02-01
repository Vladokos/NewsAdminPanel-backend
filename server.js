const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const Schema = mongoose.Schema;

const app = express();
const jsonParser = express.json();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "sql7.freesqldatabase.com",
  port: 3306,
  user: "sql7594939",
  password: "2StPUsnlSE",
  database: "sql7594939",
});

// app.use(express.static(path.join(__dirname + "/public")));
// rewrite to SQL
// 'cause MongoDB is not working in Russia
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "" + file.originalname);
  },
});
const upload = multer({ storage: storageConfig }).single("image");

const articleSchema = new Schema(
  {
    image: String,
    title: String,
    category: String,
    text: String,
  },
  { versionKey: false }
);
const Article = mongoose.model("Article", articleSchema);
// mongodb+srv://Test:<I9QRamgAooLR9oVh>@cluster1.akqdd4m.mongodb.net/?retryWrites=true&w=majority
mongoose.connect("mongodb://localhost:27017/articles", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

app.use(express.static("uploads"));

app.get("/article/", (req, res) => {
  connection.query("SELECT * FROM `ARTICLE`", (errors, results, fields) => {
    return res.send(results).status(200);
  });

  // Article.find({}, (err, articles) => {
  //   if (err) throw err;
  //   return res.send(articles);
  // });
});

app.get("/article/:id", (req, res) => {
  const id = req.params.id;

  connection.query(
    "SELECT * FROM `ARTICLE` WHERE `id` = " + id,
    (errors, results, fields) => {
      return res.send(results).status(200);
    }
  );

  // Article.findOne({ _id: id }, (err, article) => {
  //   if (err) throw err;
  //   return res.send(article);
  // });
});

app.post("/article", jsonParser, (req, res) => {
  if (!req.body) res.sendStatus(400);

  const category = req.body.category;
  const title = req.body.titles;
  const text = req.body.texts;

  connection.query(
    "INSERT INTO `ARTICLE` (`category`,`title`,`text`) VALUES(" +
      `'${category}','${title}','${text}')`,
    (errors, results, fields) => {
      // console.log(errors);
      // console.log(results.insertId);
      return res.json({ id: results.insertId }).status(200);
    }
  );

  // const article = new Article({ category: category, title: title, text: text });

  // article.save((err, doc) => {
  //   if (err) throw err;
  //   return res.json(doc).status(200);
  // });
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
  // const article = {
  //   id: id,
  //   image: image,
  // };

  // Article.findByIdAndUpdate({ _id: id }, article, { new: true }, (err, doc) => {
  //   if (err) throw err;
  //   return res.json(doc).status(200);
  // });
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

  // const article = {
  //   id: id,
  //   category: category,
  //   title: title,
  //   text: text,
  // };

  // Article.findOneAndUpdate({ _id: id }, article, { new: true }, (err, doc) => {
  //   if (err) throw err;
  //   return res.json(doc).status(200);
  // });
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
    `DELETE FROM ARTICLE WHERE id = ${id}`, (errors, results, fields) =>{
      return res.sendStatus(200);
    }
  )

  // Article.findByIdAndDelete({ _id: id }, (err, doc) => {
  //   if (err) throw err;
  //   return res.sendStatus(200);
  // });
});

app.listen(5000, () => {
  console.log("Servr is running");
});
