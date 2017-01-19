var utils = require('./utils.js');
var Cat = require('./cat.js');
var Mouse = require('./mouse.js');

module.exports = (function () {
    function Generator() {
        this.places = [];
        this.mouses = {
            list : [],
            idx: 0,
            timeout: 5
        };
        this.cats = {
            list : [],
            idx: 50,
            timeout: 50
        };
        this.type = "Regular";
        this.timeout = 1000;
        this.nextGenerators = [CatMania, MouseMania];
        this.preserve = false;
    }

    Generator.prototype.getMouses = function() {
        return this.mouses.list;
    };

    Generator.prototype.getCats = function() {
        return this.cats.list;
    };

    Generator.prototype.setMouses = function(mouses) {
        return this.mouses.list = mouses;
    };

    Generator.prototype.setCats = function(cats) {
        return this.cats.list = cats;
    };

    Generator.prototype.nextGenerator = function() {
        var next = Math.round(Math.random() * 500) % this.nextGenerators.length;
        var nextGen = new this.nextGenerators[next]();
        if(this.preserve) {
            nextGen.mouses.list = this.mouses.list;
            nextGen.cats.list = this.cats.list;
        }
        return nextGen;
    };

    Generator.prototype.generate = function() {
        this.generateObj(this.mouses, Mouse);
        this.generateObj(this.cats, Cat);
        if(this.timeout-- < 0) {
            return this.nextGenerator();
        }
        return undefined;
    };

    Generator.prototype.generateObj = function(obj, Type) {
        if(obj.idx-- === 0) {
            for(var i = 0; i < this.places.length; i++) {
                var place = this.places[i];
                obj.list = obj.list.concat(new Type(place.x, place.y, place.or));
            }
            obj.idx = obj.timeout * 10;
        }
    };

    Generator.prototype.init = function (size) {
        for(var i = 0; i < size; i++) {
            this.places.push(utils.randomArrow());
        }
        return this;
    };

    CatMania.prototype = new Generator();
    function CatMania() {
        this.type = "CatMania";
        this.mouses.timeout = -1;
        this.mouses.idx = -1;
        this.cats.timeout = 5;
        this.cats.idx = 10;
        this.nextGenerators = [Generator];
        this.timeout = 200;
        this.preserve = true;
    }

    MouseMania.prototype = new Generator();
    function MouseMania() {
        this.type = "MouseMania";
        this.mouses.timeout = 2;
        this.cats.timeout = -1;
        this.cats.idx = -1;
        this.nextGenerators = [Generator];
        this.timeout = 300;
        this.preserve = true;
    }

    return {
        Regular : Generator,
        CatMania: CatMania,
        MouseMania: MouseMania
    };
})();
