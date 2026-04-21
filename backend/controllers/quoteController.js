const Quote = require("../models/Quote");

exports.createQuote = async (req, res) => {
  const { type, parametres } = req.body;

  let prix = 0;

  if (type === "auto") prix = 500 + parametres.age * 2;
  else prix = 300;

  const quote = new Quote({
    userId: req.user.id,
    type,
    prix,
    parametres
  });

  await quote.save();

  res.json(quote);
};

exports.getQuotes = async (req, res) => {
  const quotes = await Quote.find({ userId: req.user.id });
  res.json(quotes);
};