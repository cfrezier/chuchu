var utils = require('./utils.js');

module.exports = (function () {

    function Game(socket, games) {
        this.code = this.generateCode(games);
        this.presenterSocket = socket;
        this.players = [];
        this.mouses = [new Mouse(10, 20, 0), new Mouse(10, 30, 0), new Mouse(10, 40, 0)];
        this.cats = [new Cat(50, 60, 0)];
        this.end = false;
    }

    Game.prototype.generateCode = function (games) {
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
        this.players.push(player);
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

        setTimeout(function () {
            this.executeStep();
        }, 10);
    };

    Game.prototype.broadcast = function (evt, obj) {
        this.presenterSocket.emit(evt, obj);
        this.players.forEach(function (player) {
            player.socket.emit(evt, obj);
        });
    };

    Game.prototype.executeStep = function () {
        var game = this;
        // Boucle main de calcul du jeu

        // Faire bouger les objets
        this.mouses.forEach(function (mouse) {
            mouse.move(game.players);
        });
        this.cats.forEach(function (cat) {
            cat.move(game.players);
        });
        this.players.forEach(function (player) {
            player.move();
        });

        // Les chats mangent les souris
        this.cats.forEach(function (cat) {
            cat.eat(game.mouses);
        });
        game.mouses = game.mouses.filter(filterEaten);

        // Les souris et les chats montent dans les goals
        game.players.forEach(function (player) {
            player.goal(game.mouses, game.cats);
        });
        game.mouses = game.mouses.filter(filterEaten);
        game.cats = game.cats.filter(filterEaten);

        // Fin ?

        // Envoi de la game recalculée pour affichage
        this.broadcast("draw", JSON.stringify(this));
    };

    function filterEaten(obj) {
        return obj.eaten;
    }

    return Game;
})();
