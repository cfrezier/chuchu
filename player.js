
var playerIdGenerator = 0;

function Player(name, socket, game) {
    this.name = name.toUpperCase();
    this.socket = socket;
    this.id = playerIdGenerator++;

    this.color = "#FF0000";
    this.score = 0;
    this.goal = {x: 0, y: 0};
    this.cursor = {x: 0, y: 0, or : -1};
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

Player.prototype.createArrow = function(obj) {
    if(this.arrows.length >= 3) {
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

Player.prototype.goal = function (cats, mouses) {
    var player = this;

    cats.forEach(function (cat) {
        if (distance(cat, player) < 5) {
            cat.eaten = true;
            player.score /= 2;
        }
    });

    mouses.forEach(function (mouse) {
        if (distance(mouse, player) < 5) {
            mouse.eaten = true;
            player.score++;
        }
    })
};

Player.prototype.move = function() {
    moveObject(this.cursor);
};