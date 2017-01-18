var utils = require('./utils.js');
var Mouse = require('./mouse.js');
var Cat = require('./cat.js');
var Player = require('./player.js');

module.exports = (function () {

    function Game(socket, games) {
        this.code = this.generateCode(games);
        this.presenterSocket = socket;
        this.players = [];
        this.mouses = [new Mouse(5, 5, 0), new Mouse(5, 10, 0), new Mouse(5, 15, 0)];
        this.cats = [new Cat(4, 4, 0)];
        this.end = false;
    }

    Game.prototype.drawData = function() {
        return {
            players : this.players.map(function(player) { return player.drawData()}),
            mouses: this.mouses,
            cats: this.cats
        }
    };

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

    Game.prototype.getPlayerBySocket = function(socket) {
        return this.players.filter(function (player) {
            return player.socket === socket;
        })[0];
    };

    Game.prototype.createPlayer = function (name, socket) {
        var player = new Player(name, socket, this);
        this.players.push(player);
        socket.emit('identify', {"id": player.id});
        return player;
    };

    Game.prototype.getPlayerByName = function (name) {
        return this.players.filter(function (player) {
            return name === player.name;
        })[0];
    };

    Game.prototype.start = function () {
        this.state = "playing";
        this.broadcast("start");

        this.planNextStep();
        return this;
    };
    Game.prototype.planNextStep = function() {
        var game = this;
        setTimeout(function () {
            game.executeStep();
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
        game.mouses.forEach(function (mouse) {
            mouse.move(game.players);
        });
        game.cats.forEach(function (cat) {
            cat.move(game.players);
        });
        game.players.forEach(function (player) {
            player.move();
        });

        // Les chats mangent les souris
        game.cats.forEach(function (cat) {
            cat.eat(game.mouses);
        });
        game.mouses = game.mouses.filter(filterEaten);

        // Les souris et les chats montent dans les goals
        game.players.forEach(function (player) {
            player.scorePoints(game.mouses, game.cats);
        });
        game.mouses = game.mouses.filter(filterEaten);
        game.cats = game.cats.filter(filterEaten);

        // Envoi de la game recalculée pour affichage
        game.broadcast("draw", this.drawData());

        game.planNextStep();
    };

    function filterEaten(obj) {
        return obj.eaten;
    }

    return Game;
})();
