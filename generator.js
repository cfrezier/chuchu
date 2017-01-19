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

    Generator.prototype.generate = function() {
        this.generateObj(this.mouses, Mouse);
        this.generateObj(this.cats, Cat);
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
        this.cats.timeout = 10;
        this.cats.idx = 10;
    }

    MouseMania.prototype = new Generator();
    function MouseMania() {
        this.type = "MouseMania";
        this.mouses.timeout = 2;
        this.cats.timeout = -1;
    }

    return {
        Regular : Generator,
        CatMania: CatMania,
        MouseMania: MouseMania
    };
})();
