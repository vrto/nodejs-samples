var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');

var root = __dirname;

var server = http.createServer(function(req, res) {
    var url = parse(req.url);
    var path = join(root, url.pathname);

    fs.stat(path, function(err, stat) {
        if (err)
            handleErrors(err);
        else
            handleContent(stat);
    });

    function handleErrors(err) {
        if ('ENONET' == err.code) {
            res.statusCode = 404;
            res.end('Not Found');
        } else {
            internalServerError();
        }
    }

    function internalServerError() {
        res.statusCode = 500;
        res.end('Internal Server Error');
    }

    function handleContent(stat) {
        res.setHeader('Content-Length', stat.size);
        var stream = fs.createReadStream(path);
        stream.pipe(res);
        stream.on('error', function(err) {
            internalServerError();
        });
    }
});

server.listen(3000);