var utils = require('./utils.js');

module.exports = (function () {
    function Cat(x, y, orientation) {
        this.x = x;
        this.y = y;
        this.or = orientation;
        this.eaten = false;
    }

    Cat.prototype.move = function (players) {
        utils.moveCheckArrows(this, players);
    };

    Cat.prototype.eat = function (mouses) {
        var cat = this;
        mouses.forEach(function (mouse) {
            if (utils.distance(mouse, cat) < 10) {
                mouse.eaten = true;
            }
        })
    };

    return Cat;
})();
