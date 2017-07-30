var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

var config = {
    userName: 'kulikr',
    password: 'wuyW9spl',
    server: 'roybenshop.database.windows.net',
    requestTimeout: 5000,
    options: { encrypt: true, database: 'db_shop' }
};

var queue = [];

//----------------------------------------------------------------------------------------------------------------------
exports.Select = function (query) {
    return new Promise(function (resolve, reject) {
        var connection = new Connection(config);
        var ans = [];
        var properties = [];
        connection.on('connect', function (err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
                return;
            }
            console.log('connection on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
            });

            dbReq.on('columnMetadata', function (columns) {
                columns.forEach(function (column) {
                    if (column.colName != null)
                        properties.push(column.colName);
                });
            });
            dbReq.on('row', function (row) {
                var item = {};
                for (i = 0; i < row.length; i++) {
                    item[properties[i]] = row[i].value;
                }
                ans.push(item);
            });

            dbReq.on('requestCompleted', function () {
                console.log('request Completed: ' + dbReq.rowCount + ' row(s) returned');
                console.log(ans);
                resolve(ans);
                connection.close();
                console.log("connection off");
                if (queue.length > 0) {
                    var req = queue.shift();
                    connection.execSql(req);
                }
                else {

                }
            });
            if (queue.length == 0) {
                connection.execSql(dbReq);
            }
            else {
                queue.push(dbReq);
            }


        });
    });
};
//----------------------------------------------------------------------------------------------------------------------

var sqlFunction = function (query) {
    return new Promise(function (resolve, reject) {
        var connection = new Connection(config);
        connection.on('connect', function (err) {
            if (err) {
                console.error('error connecting: ' + err.message);
                reject(err);
            }
            console.log('connection on');
            var dbReq = new Request(query, function (err, rowCount) {
                if (err) {
                    console.log(err);
                    connection.close();
                    reject(err);
                }
            });
            dbReq.on('requestCompleted', function () {
                connection.close();
                console.log('connection off');
                resolve(dbReq.rowCount);
                if (queue.length > 0) {
                    var req = queue.shift();
                    connection.execSql(req);
                }
            });

            if (queue.length == 0) {
                connection.execSql(dbReq);
            }
            else {
                queue.push(dbReq);
            }
        });
    });
};

exports.Delete = sqlFunction;
exports.Update = sqlFunction;
exports.Insert = sqlFunction;

