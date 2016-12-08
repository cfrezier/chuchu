var __prep = (function (Presenter, Player, PORT) {

    function PrepareGame() {
        var socket = null;
        var executor = null;

        return {
            connect: function () {
                socket = io();
            },
            iAm: function (what) {
                if (what === 'presenter') {
                    executor = new Presenter(socket);
                } else {
                    executor = new Player(socket, document.querySelector("#name").value, document.querySelector("#code").value);
                }
                executor.execute(this);
            },
            showPanel: function (type) {
                var allPanels = ["#startPanel", "#controllerPanel"];
                allPanels.forEach(function (panel) {
                    document.querySelector(panel).style.display = "none";
                });
                document.querySelector("#" + type + "Panel").style.display = "block";
            },
            lie: function () {
                executor.lie();
            },
            start: function () {
                executor.start();
            }
        }
    }

    return new PrepareGame();

})(Presenter, Player, 8001);

function load() {
    __prep.connect();
}

function iAm(what) {
    __prep.iAm(what);
}

function lie() {
    __prep.lie();
}

function start() {
    __prep.start();
}
