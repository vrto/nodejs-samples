var flow = require('nimble');
var exec = require('child_process').exec;

function downloadNode(version, destination, callback) {
    var url = 'http://nodejs.org/dist/node-v' + version + '.tar.gz';
    var filepath = destination + '/' + version + '.tgz';
    exec('curl ' + url + ' >' + filepath, callback);
}

flow.series([
    function(callback) {
        flow.parallel([
            function(callback) {
                console.log('Downoloading node.js 0.4.6...');
                downloadNode('0.4.6', './tmp', callback);
            },
            function(callback) {
                console.log('Downloading node.js 0.4.7...');
                downloadNode('0.4.7', './tmp', callback);
            }
        ], callback);
    },
    function(callback) {
        console.log('Creating archive from downloaded files ...');
        exec(
            'tar cvf node_distros.tar ./tmp/0.4.6.tgz ./tmp/0.4.7.tgz',
            function(error, stdout, stderr) {
                console.log('All done');
                callback();
            }
        );
    }
]);