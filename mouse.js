function Mouse(x, y, orientation) {
    this.x = x;
    this.y = y;
    this.or = orientation;
    this.eaten = false;
}

Mouse.prototype.move = function (players) {
    moveCheckArrows(this, players);
};