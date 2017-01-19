var utils = require('./utils.js');
var Cat = require('./cat.js');
var Mouse = require('./mouse.js');

module.exports = (function () {
    function Generator() {
        this.places = [];
        this.mouses = {
            list   : [],
            idx    : 0,
            timeout: 5
        };
        this.cats = {
            list   : [],
            idx    : 75,
            timeout: 75
        };
        this.type = "Regular";
        this.timeout = 1500;
        this.nextGenerators = [CatMania, MouseMania];
        this.preserve = true;
        this.nbPlaces = 1;
    }

    Generator.prototype.getMouses = function () {
        return this.mouses.list;
    };

    Generator.prototype.getCats = function () {
        return this.cats.list;
    };

    Generator.prototype.setMouses = function (mouses) {
        return this.mouses.list = mouses;
    };

    Generator.prototype.setCats = function (cats) {
        return this.cats.list = cats;
    };

    Generator.prototype.nextGenerator = function () {
        var next = Math.round(Math.random() * 500) % this.nextGenerators.length;
        var nextGen = new this.nextGenerators[next]();
        if (nextGen.preserve) {
            nextGen.mouses.list = this.mouses.list;
            this.mouses.list = [];
            nextGen.cats.list = this.cats.list;
            this.cats.list = [];
            this.finished = true;
        }
        return nextGen;
    };

    Generator.prototype.generate = function () {
        if (!this.finished) {
            this.generateObj(this.mouses, Mouse);
            this.generateObj(this.cats, Cat);
            if (this.timeout-- < 0) {
                return this.nextGenerator();
            }
            return undefined;
        }
    };

    Generator.prototype.generateObj = function (obj, Type) {
        if (obj.idx-- === 0) {
            for (var i = 0; i < this.places.length; i++) {
                var place = this.places[i];
                obj.list = obj.list.concat(new Type(place.x, place.y, place.or));
            }
            obj.idx = obj.timeout * 10;
        }
    };

    Generator.prototype.init = function () {
        this.places = [];
        for (var i = 0; i < this.nbPlaces; i++) {
            this.places.push(utils.randomArrow());
        }
        return this;
    };

    CatMania.prototype = new Generator();
    function CatMania() {
        this.type = "CatMania";
        this.mouses.timeout = -1;
        this.mouses.idx = -1;
        this.cats.timeout = 20;
        this.cats.idx = 5;
        this.nextGenerators = [Generator];
        this.timeout = 300;
        this.preserve = false;
        this.nbPlaces = 2;
    }

    MouseMania.prototype = new Generator();
    function MouseMania() {
        this.type = "MouseMania";
        this.mouses.timeout = 2;
        this.cats.timeout = -1;
        this.cats.idx = -1;
        this.nextGenerators = [Generator];
        this.timeout = 500;
        this.preserve = false;
        this.nbPlaces = 3;
    }

    return {
        Regular   : Generator,
        CatMania  : CatMania,
        MouseMania: MouseMania
    };
})();
