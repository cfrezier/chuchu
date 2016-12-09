function Cat(x, y, orientation) {
    this.x = x;
    this.y = y;
    this.or = orientation;
    this.eaten = false;
}

Cat.prototype.move = function (players) {
    moveCheckArrows(this, players);
};

Cat.prototype.eat = function (mouses) {
    var cat = this;
    mouses.forEach(function (mouse) {
        if (distance(mouse, cat) < 5) {
            mouse.eaten = true;
        }
    })
};