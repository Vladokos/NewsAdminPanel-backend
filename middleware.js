module.exports = function (app) {
  app.use(cors());
  app.use(express.static("uploads"));
};
