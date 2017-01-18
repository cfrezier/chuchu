var MAX_X = 300;

var Presenter = (function () {
    var Presenter = function (socket) {
        this.socket = socket;
        this.code = null;
        this.playerContainer = document.querySelector("#playersContainer");
        this.canvas = document.getElementById("card");
        this.ctxt = this.canvas.getContext("2d");
    };

    Presenter.prototype.tranformX = function(x) {
        return this.canvas.width / MAX_X * x;
    };

    Presenter.prototype.tranformY = function(x) {
        return this.canvas.height / MAX_X * x;
    };

    var i = 50;

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

            game.players.forEach(function(player) {
                presenter.ctxt.strokeStyle = player.color;
                presenter.ctxt.fillStyle = player.color;
                presenter.drawPlayer(player);
                presenter.drawGoal(player);

                if(i-- < 0) {
                    console.log(JSON.stringify(player));
                    i = 50;
                }
            });

            // Draw Mouses
            // Draw Cats
        })
    };

    Presenter.prototype.drawPlayer = function(player) {
        this.ctxt.font="5px Arial";
        this.ctxt.fillText(player.name.substr(0, 1), this.tranformX(player.cursor.x), this.tranformY(player.cursor.y));
    };

    Presenter.prototype.drawGoal = function(player) {
        this.ctxt.beginPath();
        this.ctxt.arc(this.tranformX(player.goal.x), this.tranformY(player.goal.y), 3, 0, 2*Math.PI);
        this.ctxt.stroke();
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

    return Presenter;
})();