var Presenter = (function () {
    var Presenter = function (socket) {
        this.socket = socket;
        this.code = null;
        this.playerContainer = document.querySelector("#playersContainer");
        this.canvas = document.getElementById("card");
        this.ctxt = this.canvas.getContext("2d");
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

            game.players.forEach(function(player) {
                // Draw cursors
                presenter.ctxt.fillText(player.name, player.cursor.x, player.cursor.y);

                // Draw goals
                presenter.ctxt.fillStyle = player.color;
                presenter.ctxt.beginPath();
                presenter.ctxt.arc(player.goal.x, player.goal.y, 10, 0, 2*Math.PI);
                presenter.ctxt.stroke();
            });

            // Draw Mouses
            // Draw Cats

        })
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