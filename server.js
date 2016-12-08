(function (DISPLAY_TIMEOUT, ANSWER_TIMEOUT, SHORT_DISPLAY_TIMEOUT, HTTP_PORT, NUMBER_QUESTION) {
    var games = [];
    var players = [];
    var playerIdGenerator = 0;
    var lies = undefined;

    require('./array.js');

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
            games.push(game);

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

    function Arrow(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.or = orientation;
    }

    function Player(name, socket, game) {
        this.name = name.toUpperCase();
        this.socket = socket;
        this.id = playerIdGenerator++;

        this.color = "#FF0000";
        this.count = 0;
        this.goal = {x: 0, y: 0};
        this.cursor = {x: 0, y: 0};
        this.arrows = [];
    }

    function getPlayerById(id) {
        return players.filter(function (player) {
            return player.id === id;
        })[0];
    }

    function getPlayerBySocket(socket) {
        return players.filter(function (player) {
            return player.socket === socket;
        })[0];
    }

    function Game(socket) {
        this.code = this.generateCode();
        this.presenterSocket = socket;
        this.players = [];
        this.mouses = [];
        this.cats = [];
        this.end = false;
    }

    function getGameByCode(code) {
        return games.filter(function (game) {
            return game.code === code;
        })[0];
    }

    Game.prototype.generateCode = function () {
        var valid = false;
        while (!valid) {
            var candidate = randomString(5, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
            valid = games.filter(function (game) {
                    return game.code === candidate;
                }).length === 0;
        }
        return candidate;
    };

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    Game.prototype.createPlayer = function (name, socket) {
        var player = new Player(name, socket, this);
        this.players.push(player);
        players.push(player);
        socket.emit('identify', {"id": player.id});
    };

    Game.prototype.getPlayerByName = function (name) {
        return this.players.filter(function (player) {
            return name === player.name;
        })[0];
    };

    Game.prototype.start = function () {
        this.state = "playing";
        this.broadcast("start");

        setTimeout(function() {
            this.executeStep();
        }, 10);
    };

    Game.prototype.broadcast = function (evt, obj) {
        this.presenterSocket.emit(evt, obj);
        this.players.forEach(function (player) {
            player.socket.emit(evt, obj);
        });
    };

    Game.prototype.executeStep = function() {
        // Boucle main de calcul du jeu



        // Envoi de la game recalculée pour affichage
        this.broadcast("draw", JSON.stringify(this));
    };


})(5000, 30000, 1000, 8000, 7);