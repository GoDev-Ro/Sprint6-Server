var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var port        = process.env.PORT || 8080;
var router      = express.Router();
var store       = require('./transactionStore');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Cache-Control', 'no-cache');

    next();
});

router.get('/', function(req, res) {
    res.json({ message: 'API works, but this endpoint does nothing' });
});

router.route('/:dev/transactions')
    .options(function(req, res) {
        res.header('Access-Control-Allow-Methods', 'GET, POST').send();
    })
    .get(function(req, res) {
        store.setDev(req.params.dev).getTransactionsInMonth(req.query.month).then(
            function(result) {
                res.json(result);
            },
            function(error) {
                res.status(500).json({
                    error: error.message
                });
            }
        );
    })
    .post(function(req, res) {
        store.setDev(req.params.dev).add(req.body).then(
            function(item) {
                res.status(201).json(item);
            },
            function(error) {
                res.status(409).json({
                    error: error.message
                });
            }
        );
    });

router.route('/:dev/transactions/:id')
    .options(function(req, res) {
        res.header('Access-Control-Allow-Methods', 'DELETE').send();
    })
    .delete(function(req, res) {
        store.setDev(req.params.dev).delete(req.params.id).then(
            function() {
                res.status(204).send();
            },
            function(error) {
                res.status(409).json({
                    error: error.message
                });
            }
        );
    });

app.use('/api', router);
app.listen(port);

console.log('Listening on port ' + port);
