module.exports = function (app, cors, express, path) {
  app.use(cors());
  app.use(express.static("uploads"));
  app.use(express.static(path.join(__dirname, "build")));

  app.get("*", function (req, res, next) {
    res.sendFile(path.join(__dirname, "./build/index.html"));
  });
};
