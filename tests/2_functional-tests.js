const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

    let likes1;

    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'stock');
                assert.property(res.body.stockData, 'price');
                assert.property(res.body.stockData, 'likes');
                assert.equal(res.body.stockData.stock, 'GOOG');
                done();
            });
    });

    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: 'true' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, 'stockData');
                assert.property(res.body.stockData, 'likes');
                assert.isNumber(res.body.stockData.likes);
                likes1 = res.body.stockData.likes;
                assert.isAbove(likes1, 0);
                done();
            });
    });

    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: 'true' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.stockData.likes, likes1); // Should not increase
                done();
            });
    });

    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'MSFT'] })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.lengthOf(res.body, 2);
                assert.property(res.body[0], 'stock');
                assert.property(res.body[0], 'rel_likes');
                assert.property(res.body[1], 'stock');
                assert.property(res.body[1], 'rel_likes');
                done();
            });
    });

    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: ['GOOG', 'MSFT'], like: 'true' })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.lengthOf(res.body, 2);
                assert.property(res.body[0], 'rel_likes');
                assert.property(res.body[1], 'rel_likes');
                done();
            });
    });
});
