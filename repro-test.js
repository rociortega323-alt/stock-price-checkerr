const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('./server');

chai.use(chaiHttp);

suite('Reproduction Tests', function () {
    test('Reproduction: Viewing two stocks and liking them, verifying rel_likes', function (done) {
        // First like GOOG to ensure a diff
        chai.request(server)
            .get('/api/stock-prices')
            .query({ stock: 'GOOG', like: 'true' })
            .end(function (err, res) {
                // Then get both
                chai.request(server)
                    .get('/api/stock-prices')
                    .query({ stock: ['GOOG', 'MSFT'] })
                    .end(function (err, res) {
                        console.log('Response Body:', JSON.stringify(res.body, null, 2));
                        assert.equal(res.status, 200);
                        assert.property(res.body, 'stockData');
                        assert.isArray(res.body.stockData);
                        assert.lengthOf(res.body.stockData, 2);
                        assert.isNumber(res.body.stockData[0].rel_likes);
                        assert.isNumber(res.body.stockData[1].rel_likes);
                        assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0); // Sum should be 0
                        done();
                    });
            });
    });
});
