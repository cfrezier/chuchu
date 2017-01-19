var MAX_X = 300;

var Presenter = (function () {
    var Presenter = function (socket) {
        this.socket = socket;
        this.code = null;
        this.playerContainer = document.querySelector("#playersContainer");
        this.canvas = document.getElementById("card");
        this.ctxt = this.canvas.getContext("2d");
    };

    Presenter.prototype.tranformX = function (x) {
        return this.canvas.width / MAX_X * x;
    };

    Presenter.prototype.tranformY = function (x) {
        return this.canvas.height / MAX_X * x;
    };

    Presenter.prototype.execute = function (ctxt) {
        var presenter = this;

        this.socket.emit('iam:presenter');

        this.socket.on('display:code', function (data) {
            presenter.code = data;
            document.querySelector("#codeText").innerHTML = data;
            ctxt.showPanel("code");
        });

        this.socket.on('display:player', function (data) {
            presenter.playerContainer.appendChild(addElementText(data.name));
            ctxt.showPanel("code");
        });

        this.socket.on('start', function (data) {
            ctxt.showPanel("card");
        });

        this.socket.on('draw', function (game) {
            presenter.ctxt.clearRect(0, 0, presenter.canvas.width, presenter.canvas.height);

            game.players.forEach(function (player) {
                presenter.drawPlayer(player);
                presenter.drawGoal(player);
                player.arrows.forEach(function (arrow) {
                    presenter.drawArrow(arrow);
                });
            });

            game.mouses.forEach(function (mouse) {
                presenter.drawMouse(mouse);
            });

            game.cats.forEach(function (cat) {
                presenter.drawCat(cat);
            });

            document.getElementById("type").innerHTML = game.type;
            game.player.sort(function (pl1, pl2) {
                return pl2.score - pl1.score;
            });
            document.getElementById("score").innerHTML = game.players
                .map(function (player) {
                    return '<div>' + player.name + " : " + player.score + '</div>';
                })
                .join();
        })
    };

    Presenter.prototype.drawPlayer = function (player) {
        this.ctxt.font = "8px Arial";
        this.ctxt.fillStyle = player.color;
        this.ctxt.fillText(player.name.substr(0, 1), this.tranformX(player.cursor.x), this.tranformY(player.cursor.y));
    };

    Presenter.prototype.drawArrow = function (arrow) {
        var fromArrow = {x: arrow.x, y: arrow.y, or: arrow.or};
        var toArrow = {x: arrow.x, y: arrow.y, or: arrow.or};
        moveObjectNoCheck(fromArrow, -4);
        moveObjectNoCheck(toArrow, 4);

        var headlen = 5;
        var angle = Math.atan2(toArrow.y - fromArrow.y, toArrow.x - fromArrow.x);
        this.ctxt.beginPath();
        this.ctxt.moveTo(this.tranformX(fromArrow.x), this.tranformY(fromArrow.y));
        this.ctxt.lineTo(this.tranformX(toArrow.x), this.tranformY(toArrow.y));
        this.ctxt.lineTo(this.tranformX(toArrow.x - headlen * Math.cos(angle - Math.PI / 6)), this.tranformY(toArrow.y - headlen * Math.sin(angle - Math.PI / 6)));
        this.ctxt.moveTo(this.tranformX(toArrow.x), this.tranformY(toArrow.y));
        this.ctxt.lineTo(this.tranformX(toArrow.x - headlen * Math.cos(angle + Math.PI / 6)), this.tranformY(toArrow.y - headlen * Math.sin(angle + Math.PI / 6)));
        this.ctxt.stroke();
    };

    Presenter.prototype.drawGoal = function (player) {
        this.ctxt.strokeStyle = player.color;
        drawCircle.call(this, player.goal, 5);
        this.ctxt.fill();
    };

    Presenter.prototype.drawMouse = function (mouse) {
        this.ctxt.strokeStyle = "brown";
        drawCircle.call(this, mouse, 4);
        var head = {x: mouse.x, y: mouse.y, or: mouse.or};
        moveObjectNoCheck(head, 3);
        drawCircle.call(this, head, 2);
    };

    Presenter.prototype.drawCat = function (mouse) {
        this.ctxt.strokeStyle = "black";
        drawCircle.call(this, mouse, 5);
        var head = {x: mouse.x, y: mouse.y, or: mouse.or};
        moveObjectNoCheck(head, 4);
        drawCircle.call(this, head, 3);
    };

    Presenter.prototype.start = function () {
        this.socket.emit('start', {code: this.code});
    };

    function addElementText(msg) {
        var text = document.createTextNode(msg);
        var p = document.createElement("P");
        p.appendChild(text);
        return p;
    }

    function drawCircle(obj, size) {
        this.ctxt.beginPath();
        this.ctxt.arc(this.tranformX(obj.x), this.tranformY(obj.y), size, 0, 2 * Math.PI);
        this.ctxt.stroke();
    }

    function moveObjectNoCheck(obj, increment) {
        switch (obj.or) {
            case 0:
                obj.x = obj.x + increment;
                break;
            case 1:
                obj.y = obj.y + increment;
                break;
            case 2:
                obj.x = obj.x - increment;
                break;
            case 3:
                obj.y = obj.y - increment;
                break;
            default:
            // don't move
        }
        return obj;
    }

    return Presenter;
})();