var utils = require('./utils.js');
var Arrow = require('./arrow.js');

module.exports = (function () {
    var playerIdGenerator = 0;

    function Player(name, socket, game) {
        this.name = name.toUpperCase();
        this.socket = socket;
        this.id = playerIdGenerator++;

        this.color = "#FF0000";
        this.score = 0;
        this.goal = {x: 0, y: 0};
        this.cursor = {x: 0, y: 0, or: -1};
        this.arrows = [];

        this.or = -1;

        var player = this;
        this.socket.on('player:move', function (obj) {
            player.startMove(obj)
        });
        this.socket.on('player:move', function (obj) {
            player.endMove(obj)
        });
        this.socket.on('player:place', function (obj) {
            player.createArrow(obj)
        });
    }

    Player.prototype.drawData = function () {
        return {
            name: this.name,
            id: this.id,
            color: this.color,
            score: this.score,
            cursor: this.cursor,
            arrows: this.arrows.map(function(arrow) {
                arrow.drawData()
            })
        };
    };

    Player.prototype.createArrow = function (obj) {
        if (this.arrows.length >= 3) {
            this.arrows.shift();
        }
        this.arrows.push(new Arrow(this.cursor.x, this.cursor.y, obj.orientation, this));
    };

    Player.prototype.startMove = function (obj) {
        this.or = obj.move;
    };

    Player.prototype.endMove = function (obj) {
        this.or = -1;
    };

    Player.prototype.move = function (obj) {
        this.or = -1;
    };

    Player.prototype.scorePoints = function (cats, mouses) {
        var player = this;

        cats.forEach(function (cat) {
            if (utils.distance(cat, player) < 5) {
                cat.eaten = true;
                player.score /= 2;
            }
        });

        mouses.forEach(function (mouse) {
            if (utils.distance(mouse, player) < 5) {
                mouse.eaten = true;
                player.score++;
            }
        })
    };

    Player.prototype.move = function () {
        utils.moveObject(this.cursor);
    };

    return Player;
})();