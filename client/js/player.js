var Player = (function () {
    var Player = function (socket, name, code) {
        this.socket = socket;
        this.name = name.toUpperCase();
        this.code = code.toUpperCase();
        this.id = -1;
    };

    Player.prototype.execute = function (ctxt) {
        var player = this;
        player.ctxt = ctxt;

        this.socket.emit('iam:player', {"name": this.name, "code": this.code});
        ctxt.showPanel("wait");

        this.socket.on('identify', function (data) {
            player.id = data.id;
        });

        this.socket.on('wrong:code', function (data) {
            alert("mauvais code entré");
        });

        this.socket.on('start', function() {
            ctxt.showPanel("controller");
            player.createControllerButtons();
        })
    };

    Player.prototype.createControllerButtons = function () {
        var player = this;
        var types = ['move', 'place'];
        for (var k = 0; k < types.length; k++) {
            var kind = types[k];

            for (var i = 0; i < 4; i++) {
                (function(i, kind) {
                    var div = document.getElementById(kind + i);
                    div.addEventListener('touchstart', function (e) {
                        player.socket.emit('player:' + kind, { id: player.id, move: i});
                        e.preventDefault();
                    }, false);
                    div.addEventListener('touchenter', function (e) {
                        player.socket.emit('player:' + kind, { id: player.id, move: i});
                        e.preventDefault();
                    }, false);
                    div.addEventListener('mousedown', function (e) {
                        player.socket.emit('player:' + kind, { id: player.id, move: i});
                        e.preventDefault();
                    }, false);
                })(i, kind);

                (function(i, kind) {
                    var div = document.getElementById(kind + i);
                    div.addEventListener('touchend', function (e) {
                        player.socket.emit('player:end:' + kind, { id: player.id, orientation: i});
                        e.preventDefault();
                    }, false);
                    div.addEventListener('mouseup', function (e) {
                        player.socket.emit('player:end:' + kind, { id: player.id, orientation: i});
                        e.preventDefault();
                    }, false);
                    div.addEventListener('touchleave', function (e) {
                        player.socket.emit('player:end:' + kind, { id: player.id, orientation: i});
                        e.preventDefault()
                    }, false);
                })(i, kind);
            }
        }
    };

    return Player;
})();