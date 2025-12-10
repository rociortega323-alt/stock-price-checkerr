'use strict';
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  likes: [String]
});

const Stock = mongoose.model('Stock', StockSchema);

async function getStockPrice(symbol) {
  try {
    const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error.message);
    return null;
  }
}

async function findOrUpdateStock(symbol, like, ip) {
  let stock = await Stock.findOne({ symbol: symbol });
  if (!stock) {
    stock = new Stock({ symbol: symbol, likes: [] });
  }
  if (like) {
    if (!stock.likes.includes(ip)) {
      stock.likes.push(ip);
    }
  }
  await stock.save();
  return stock.likes.length;
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const likeBool = like === 'true';
      const ip = req.ip;
      // Anonymize IP
      const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

      if (Array.isArray(stock)) {
        const stock1Data = await getStockPrice(stock[0]);
        const stock2Data = await getStockPrice(stock[1]);

        const likes1 = await findOrUpdateStock(stock[0], likeBool, ipHash);
        const likes2 = await findOrUpdateStock(stock[1], likeBool, ipHash);

        const stock1Obj = {
          stock: stock1Data ? stock1Data.symbol : stock[0],
          price: stock1Data ? stock1Data.latestPrice : 0,
          rel_likes: likes1 - likes2
        };
        const stock2Obj = {
          stock: stock2Data ? stock2Data.symbol : stock[1],
          price: stock2Data ? stock2Data.latestPrice : 0,
          rel_likes: likes2 - likes1
        };
        res.json([stock1Obj, stock2Obj]);

      } else {
        const stockData = await getStockPrice(stock);
        const likes = await findOrUpdateStock(stock, likeBool, ipHash);

        res.json({
          stockData: {
            stock: stockData ? stockData.symbol : stock,
            price: stockData ? stockData.latestPrice : 0,
            likes: likes
          }
        });
      }
    });
};
