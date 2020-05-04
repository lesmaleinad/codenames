const express = require('express');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var js = require('./codenames-nodejs');

var socketlist = [];

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('index')
})

server.listen(3000, console.log('Starting CODENAMES on port 3000'))

//GAME LOGIC


io.on('connect', function(socket){
	socketlist.push(socket);
	socket.emit('connected');
	socket.on('gameRequest', function(player){
		js.playerAdd(player, socket)
		});
	socket.on('gameAction', function(data){
		js.gameAction(data, socket);
		});
	
	socket.on('disconnect', function(){
		  socketlist.forEach(function(so,i){
			  if(socket === so){socketlist.splice(i,1)}
		 		 })
			 })

	})