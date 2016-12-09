(function (DISPLAY_TIMEOUT, ANSWER_TIMEOUT, SHORT_DISPLAY_TIMEOUT, HTTP_PORT, NUMBER_QUESTION) {
    var games = [];
    var players = [];
    var playerIdGenerator = 0;
    var INCREMENT = 5;

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
        this.mouses = [new Mouse(10, 20, 0), new Mouse(10, 30, 0), new Mouse(10, 40, 0)];
        this.cats = [new Cat(50, 60, 0)];
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
        var game = this;
        // Boucle main de calcul du jeu

        // Faire avancer les anciens objets
        this.mouses.forEach(function(mouse) {
            mouse.move(game.players);
        });
        this.cats.forEach(function(cat) {
            cat.move(game.players);
        });

        // Les chats mangent les souris
        this.cats.forEach(function(cat) {
            cat.eat(game.mouses);
        });
        game.mouses = game.mouses.filter(filterEaten);

        // Les souris et les chats montent dans les goals
        game.players.forEach(function(player) {
           player.goal(game.mouses, game.cats);
        });

        // Fin ?

        // Envoi de la game recalculée pour affichage
        this.broadcast("draw", JSON.stringify(this));
    };

    function filterEaten(obj) {return obj.eaten;}

    Player.prototype.goal = function(cats, mouses) {
        var player = this;

        cats.forEach(function(cat) {
            if(distance(cat, player) < 5) {
                cat.eaten = true;
                player.score /= 2;
            }
        });

        mouses.forEach(function(mouse) {
            if(distance(mouse, player) < 5) {
                mouse.eaten = true;
                player.score++;
            }
        })
    };

    function Arrow(x, y, orientation, player) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.player = player;
    }

    function Mouse(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.eaten = false;
    }

    Mouse.prototype.move = function(players) {
        moveCheckArrows(this, players);
    };

    Cat.prototype.move = function(players) {
        moveCheckArrows(this, players);
    };

    Cat.prototype.eat = function(mouses) {
        var cat = this;
        mouses.forEach(function(mouse) {
            if(distance(mouse, cat) < 5) {
                mouse.eaten = true;
            }
        })
    };

    function Cat(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.eaten = false;
    }

    function moveObject(obj) {
        obj.previous = JSON.parse(JSON.stringify(obj));
        switch(obj.or) {
            case 0:
                obj.x = obj.x + INCREMENT;
                break;
            case 1:
                obj.y = obj.y + INCREMENT;
                break;
            case 2:
                obj.x = obj.x + INCREMENT;
                break;
            case 3:
                obj.y = obj.y + INCREMENT;
                break;
        }
    }

    function distance(mouse, cat) {
        return Math.sqrt(Math.pow(mouse.x - cat.x, 2) + Math.pow(mouse.y - cat.y, 2));
    }

    function moveCheckArrows(moving, players) {
        moveObject(moving);
        players.forEach(function(player) {
            player.arrows.forEach(function(arrow){
                var betweenX = (moving.previous.x >= arrow.x && arrow.x >= moving.x) || (moving.previous.x <= arrow.x && arrow.x <= moving.x);
                var betweenY = (moving.previous.y >= arrow.y && arrow.y >= moving.x) || (moving.previous.y <= arrow.y && arrow.y <= moving.y);
                if(betweenX && betweenY) {
                    moving.or = arrow.or;
                }
            });
        });
    }

})(5000, 30000, 1000, 8000, 7);