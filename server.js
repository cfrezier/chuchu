(function (DISPLAY_TIMEOUT, ANSWER_TIMEOUT, SHORT_DISPLAY_TIMEOUT, HTTP_PORT) {
    var games = [];
    var players = [];

    require('./array.js');
    var utils = require('./utils.js');
    var Game = require('./game.js');
    var Player = require('./player.js');
    var Cat = require('./cat.js');
    var Mouse = require('./mouse.js');
    var Arrow = require('./arrow.js');

    var express = require('express');
    var app = express();
    var server = null;

    try {
        app.use(express.static(__dirname + '/client'));
        app.get('/', function (req, res) {
            res.sendfile(__dirname + '/client/index.html');
        });
        server = app.listen(HTTP_PORT);
        console.log("Ready & listening to requests. Ctrl-C to stop.")
    } catch (e) {
        console.log("Error in server: " + e);
    }

    try {
        var io = require('socket.io').listen(server);
        console.log("WSServer lancé");
    } catch (e) {
        console.log("Problème WSServer" + e);
    }

    console.log("Listening to port: " + HTTP_PORT);

    io.sockets.on('connection', function (socket) {
        socket.on('iam:presenter', function (data) {
            var game = new Game(socket);
            games.push(game, games);

            game.presenterSocket.emit('display:code', game.code);
            console.log("New Game: Presenter: " + game.code);
        });

        socket.on('iam:player', function (data) {
            var game = getGameByCode(data.code);
            if (game == undefined) {
                socket.emit('wrong:code');
            } else {
                var player = game.getPlayerByName(data.name);
                if (player !== undefined) {
                    player.disconnected = false;
                    player.socket = socket;
                } else {
                    game.createPlayer(data.name, socket);
                    game.presenterSocket.emit('display:player', {"name": data.name, "id": getPlayerBySocket(socket).id});
                    console.log("[Game" + game.code + "] New Player: " + data.name);
                }
            }
        });

        socket.on('start', function (data) {
            var game = getGameByCode(data.code).start();
            console.log("[Game" + game.code + "] Game Start !");
        });
    });

    function getPlayerBySocket(socket) {
        return players.filter(function (player) {
            return player.socket === socket;
        })[0];
    }

    function getGameByCode(code) {
        return games.filter(function (game) {
            return game.code === code;
        })[0];
    }

})(5000, 30000, 1000, 8000, 7);