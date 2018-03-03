var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var storyParts=[];

var mongoose = require('mongoose');

var Word = require('./Model/word');

const dbMongo = 'mongodb://localhost:27017/bdStory';
const port = 8085;

var currentWord = "";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(dbMongo, function(err, res)
	{
		if (err) {
			console.log(`Error al conectar a la base de datos ${err}`);
		} else {
			console.log('Conexion Exitosa');
		}
	});

server.listen(port, function() {
	console.log("Actualmente en el puerto: "+port);
});

app.post('/api/setWord', function(req, res)
	{
		let word = new Word();
		word.word = req.param('inputWord');
		word.save(function(err, storedWord){
			if (err) {
				res.status(500);
				res.send({message:`Error al guardar ${err}`});
			} else {
				res.status(200);
				res.redirect('/');
				res.end();
			}
		});
	});
io.on('connection', function(socket){
	console.log("Alguiien se conecto con el hpta socket");
	socket.emit('story', storyParts);
	socket.emit('new-word', currentWord);
	socket.on('sent-story', function(data) {
		storyParts.push(data);
		io.sockets.emit('story', storyParts);
		randomWord(function(err, data) {
			io.emit('new-word', data);
		});
	});
});
function randomWord(callback) {
	Word.find({}, function(err, words) {
		var number = Match.floor(Math.random()*words.length);
		currentWord = word[number].word;
		callback(0, currentWord);
	});
}