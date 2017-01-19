var MIN = 0, MAX = 292, OFFSET_Y = 8;
var INCREMENT = 3;

function increment(start, increment, min, max, or) {
    var result = start + increment;
    if (result < min) {
        result = min;
        or.or = (or.or + 1) %4;
    }
    if (result > max) {
        result = max;
        or.or = (or.or + 1) %4;
    }
    return result;
}

function moveObject(obj, doChangeOr) {
    try {
        var or = {or : obj.or};

        delete obj.previous;
        obj.previous = JSON.parse(JSON.stringify(obj));
        switch (obj.or) {
            case 0:
                obj.x = increment(obj.x, INCREMENT, MIN, MAX, or);
                break;
            case 1:
                obj.y = increment(obj.y, INCREMENT, MIN + OFFSET_Y, MAX + OFFSET_Y, or);
                break;
            case 2:
                obj.x = increment(obj.x, -INCREMENT, MIN, MAX, or);
                break;
            case 3:
                obj.y = increment(obj.y, -INCREMENT, MIN + OFFSET_Y, MAX + OFFSET_Y, or);
                break;
            default:
            // don't move
        }
        if(doChangeOr) {
            obj.or = or.or;
        }
    } catch (e) {
        console.log("ERROR : obj:" + obj);
    }
}

function distance(mouse, cat) {
    return Math.sqrt(Math.pow(mouse.x - cat.x, 2) + Math.pow(mouse.y - cat.y, 2));
}

function moveCheckArrows(moving, players) {
    moveObject(moving, true);
    players.forEach(function (player) {
        player.arrows.forEach(function (arrow) {
            if (distance(arrow, moving) < 5) {
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

function randomArrow() {
    var arrow = randomPlace();
    arrow.or = Math.round(Math.random()*400) % 4;
    return arrow;
}

module.exports = {
    increment      : increment,
    moveObject     : moveObject,
    distance       : distance,
    moveCheckArrows: moveCheckArrows,
    randomPlace    : randomPlace,
    randomArrow    : randomArrow
};