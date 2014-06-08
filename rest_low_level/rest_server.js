var http = require('http');
var url = require('url');

var items = [];

var server = http.createServer(function(req, res) {
    switch (req.method) {
        case 'GET':
            get();
            break;
        case 'POST':
            post();
            break;
        case 'DELETE':
            del();
            break;
    }

    function get() {
        var body = items.map(function (item, i) {
            return i + ') ' + item;
        }).join('\n');
        res.setHeader('Content-Length', Buffer.byteLength(body));
        res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
        res.end(body);
    }

    function post() {
        var item = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) {
            item += chunk;
        });
        req.on('end', function () {
            items.push(item);
            res.end('OK\n');
        });
    }

    function del() {
        var path = url.parse(req.url).pathname;
        var i = parseInt(path.slice(1), 10);
        if (isNaN(i)) {
            res.statusCode = 400;
            res.end('Invalid item id');
        } else if (!items[i]) {
            res.statusCode = 404;
            res.end('Item not found');
        } else {
            items.splice(i, 1);
            res.end('OK\n');
        }
    }
});

server.listen(3000);