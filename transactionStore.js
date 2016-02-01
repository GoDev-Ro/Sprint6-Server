var currentDev = '__none',
    Promise = require('promise'),
    Transaction = require('./transaction'),
    moment = require('moment'),
    _ = require('underscore');

var validateItem = function(item) {
    var allowedProperties = ['date', 'amount', 'description'],
        i;

    if (!item || typeof item !== 'object') {
        throw new Error('Item to add must be an object');
    }

    if (item.hasOwnProperty('date') && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(item.date)) {
        throw new Error('Property "date" must be a valid date string: YYYY-MM-DD HH:mm');
    }

    if (!item.hasOwnProperty('description') || !item.description.length) {
        throw new Error('Property "description" must be a string');
    }

    if (!item.hasOwnProperty('amount') || isNaN(parseFloat(item.amount)) || !isFinite(item.amount)) {
        throw new Error('Property "amount" must be a valid number');
    }

    for (i in item) {
        if (allowedProperties.indexOf(i) === -1) {
            delete item[i];
        }
    }
};

var fromDb = function(item) {
    item = JSON.parse(JSON.stringify(item));

    item.id = item._id;
    delete item.__v;
    delete item._id;
    delete item.dev;

    item.date = moment(item.date).format('YYYY-MM-DD HH:mm');

    return item;
};

module.exports = {
    setDev: function(dev) {
        currentDev = dev;
        return this;
    },
    getMonth: function(month) {
        return new Promise(function(resolve, reject) {
            try{
                if (!/^\d{4}-\d{2}(-\d{2})?/.test(month)) {
                    throw new Error('Invalid month specified. Use format YYYY-MM or YYYY-MM-DD');
                }

                var start = moment(moment(month).format('YYYY-MM') + '-01');
                var end = moment(start).add(1, 'M');

                Transaction.find({
                    dev: currentDev,
                    date: {
                        $gte: start.toDate(),
                        $lt: end.toDate()
                    }
                }).sort({date: 'desc'}).exec(function(err, data) {
                    if (err) {
                        throw new Error(err);
                    } else {
                        resolve(_.map(data, fromDb));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    add: function(item) {
        return new Promise(function(resolve, reject) {
            try {
                validateItem(item);

                item.dev = currentDev;
                item.date = moment(item.date).toDate();

                Transaction.create(item, function(err, transaction) {
                    if (err) {
                        reject(new Error(err));
                    } else {
                        resolve(fromDb(transaction));
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    delete: function(id) {
        var self = this;

        return new Promise(function(resolve, reject) {
            Transaction.find({_id: id}).remove(function(err, numRemoved) {
                if (numRemoved) {
                    resolve();
                } else {
                    reject(new Error('No item with ID "' + id + '" found'));
                }
            });
        });
    }
};
