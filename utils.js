var MIN = 0, MAX = 292, OFFSET_Y = 8;
var INCREMENT = 3;

function increment(start, increment, min, max) {
    var result = start + increment;
    if (result < min) {
        result = min;
    }
    if (result > max) {
        result = max;
    }
    return result;
}

function moveObject(obj) {
    try {
        delete obj.previous;
        obj.previous = JSON.parse(JSON.stringify(obj));
        switch (obj.or) {
            case 0:
                obj.x = increment(obj.x, INCREMENT, MIN, MAX);
                break;
            case 1:
                obj.y = increment(obj.y, INCREMENT, MIN + OFFSET_Y, MAX + OFFSET_Y);
                break;
            case 2:
                obj.x = increment(obj.x, -INCREMENT, MIN, MAX);
                break;
            case 3:
                obj.y = increment(obj.y, -INCREMENT, MIN + OFFSET_Y, MAX + OFFSET_Y);
                break;
            default:
            // don't move
        }
    } catch (e) {
        console.log("ERROR : obj:" + obj);
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

function randomPlace() {
    return {
        x: Math.round(Math.random() * 292),
        y: Math.round(Math.random() * 292) + 8
    }
}

module.exports = {
    increment      : increment,
    moveObject     : moveObject,
    distance       : distance,
    moveCheckArrows: moveCheckArrows,
    randomPlace    : randomPlace
};