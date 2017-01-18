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
        this.goal = utils.randomPlace();
        this.cursor = utils.randomPlace();
        this.cursor.or = -1;
        this.arrows = [];

        var player = this;
        this.socket.on('player:move', function (obj) {
            player.startMove(obj);
        });
        this.socket.on('player:end:move', function (obj) {
            player.endMove(obj);
        });
        this.socket.on('player:end:place', function (obj) {
            player.createArrow(obj);
        });
    }

    Player.prototype.drawData = function () {
        return {
            name: this.name,
            id: this.id,
            color: this.color,
            score: this.score,
            cursor: this.cursor,
            goal: this.goal,
            arrows: this.arrows.map(function(arrow) {
                return arrow.drawData();
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
        this.cursor.or = obj.move;
    };

    Player.prototype.endMove = function (obj) {
        this.cursor.or = -1;
    };

    Player.prototype.scorePoints = function (mouses, cats) {
        var player = this;

        cats.forEach(function (cat) {
            if (utils.distance(cat, player.goal) < 10) {
                cat.eaten = true;
                console.log("Chat dans fusée");
                player.score /= 2;
            }
        });

        mouses.forEach(function (mouse) {
            if (utils.distance(mouse, player.goal) < 10) {
                mouse.eaten = true;
                console.log("Souris dans fusée ");
                player.score++;
            }
        })
    };

    Player.prototype.move = function () {
        utils.moveObject(this.cursor);
    };

    return Player;
})();