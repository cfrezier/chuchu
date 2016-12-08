Array.prototype.shuffle = function () {
    var i = this.length, j, temp;
    if (i == 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * ( i + 1 ));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

Array.prototype.unique = function () {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

Array.prototype.completeWith = function (lies, howMany) {
    var completed = this;
    var maxTries = 1000;
    while(completed.length < howMany && maxTries-- > 0) {
        completed = completed.concat(lies.shuffle()[0].toUpperCase()).unique();
    }
    return completed;
};

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};