module.exports = function (app, cors, express) {
  app.use(cors());
  app.use(express.static("uploads"));
};
