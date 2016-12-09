var INCREMENT = 5;
var MAX_WIDTH = 300;

function increment(start, increment) {
    var result = start + increment;
    if(result < 0) { result = 0;}
    if(result > MAX_WIDTH) { result = MAX_WIDTH;}
    return result;
}

function moveObject(obj) {
    obj.previous = JSON.parse(JSON.stringify(obj));
    switch (obj.or) {
        case 0:
            obj.x = increment(obj.x, INCREMENT);
            break;
        case 1:
            obj.y = increment(obj.y, INCREMENT);
            break;
        case 2:
            obj.x = increment(obj.x, -INCREMENT);
            break;
        case 3:
            obj.y = increment(obj.y, -INCREMENT);
            break;
        default:
        // don't move
    }
}

function distance(mouse, cat) {
    return Math.sqrt(Math.pow(mouse.x - cat.x, 2) + Math.pow(mouse.y - cat.y, 2));
}

function moveCheckArrows(moving, players) {
    moveObject(moving);
    players.forEach(function (player) {
        player.arrows.forEach(function (arrow) {
            var betweenX = (moving.previous.x >= arrow.x && arrow.x >= moving.x) || (moving.previous.x <= arrow.x && arrow.x <= moving.x);
            var betweenY = (moving.previous.y >= arrow.y && arrow.y >= moving.x) || (moving.previous.y <= arrow.y && arrow.y <= moving.y);
            if (betweenX && betweenY) {
                moving.or = arrow.or;
            }
        });
    });
}

module.exports = {
    increment : increment,
    moveObject : moveObject,
    distance : distance,
    moveCheckArrows : moveCheckArrows
};