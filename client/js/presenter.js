var Presenter = (function () {
    var Presenter = function (socket) {
        this.socket = socket;
        this.code = null;
        this.playerContainer = document.querySelector("#playersContainer");
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