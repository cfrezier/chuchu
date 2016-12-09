module.exports = (function () {
    function Arrow(x, y, orientation, player) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.player = player;
    }

    Arrow.prototype.drawData = function() {
        return {
            x: this.x,
            y: this.y,
            or: this.or
        }
    };

    return Arrow;
})();