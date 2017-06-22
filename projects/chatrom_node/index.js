var express = require("express");
var path = require("path");
var ejs = require("ejs");
var route = require("./route");
var app = express();
var server = require("http").Server(app);
var io = require("./socket")(server);

app.set('port', process.env.PORT || 8888);
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', route.index);

app.get('*', route.NotFound);



server.listen(app.get('port'), function() {
	var port = app.get('port');
	console.log('server listen on ' + 'localhost:' + port + '\n');
})

io.start();