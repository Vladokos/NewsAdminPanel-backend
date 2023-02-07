module.exports = function (app, cors, express, path) {
  app.use(cors());
  app.use(express.static("uploads"));
  app.use(express.static(path.join(__dirname, 'build')));
};
