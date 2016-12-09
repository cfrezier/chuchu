var utils = require('./utils.js');

module.exports = (function () {
    function Mouse(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.eaten = false;
    }

    Mouse.prototype.move = function (players) {
        utils.moveCheckArrows(this, players);
    };
    return Mouse;
})();
