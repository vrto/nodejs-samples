var connect = require('connect');

console.log('Logger: '); console.log(connect.logger);
console.log('Favicon: '); console.log(connect.favicon);
console.log('Method Override: '); console.log(connect.methodOverride);
console.log('vhost'); console.log(connect.vhost);
console.log('session'); console.log(connect.session);

var app = connect()
    .use(connect.logger())
    .use(hello)
    .listen(3000);