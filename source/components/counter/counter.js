var CounterDefaultConfig = {
    startOnViewport: true,
    counterDeferred: 0,
    duration: 2000,
    value: 0,
    timeout: 0,
    delimiter: ",",
    onStart: Metro.noop,
    onStop: Metro.noop,
    onTick: Metro.noop,
    onCounterCreate: Metro.noop
};

Metro.counterSetup = function (options) {
    CounterDefaultConfig = $.extend({}, CounterDefaultConfig, options);
};

if (typeof window["metroCounterSetup"] !== undefined) {
    Metro.counterSetup(window["metroCounterSetup"]);
}

var Counter = {
    name: "Counter",

    init: function( options, elem ) {
        this.options = $.extend( {}, CounterDefaultConfig, options );
        this.elem  = elem;
        this.element = $(elem);
        this.numbers = [];
        this.html = this.element.html();
        this.started = false;
        this.id = Utils.elementId("counter");

        this._setOptionsFromDOM();
        Metro.createExec(this);

        return this;
    },

    _setOptionsFromDOM: function(){
        var element = this.element, o = this.options;

        $.each(element.data(), function(key, value){
            if (key in o) {
                try {
                    o[key] = JSON.parse(value);
                } catch (e) {
                    o[key] = value;
                }
            }
        });
    },

    _create: function(){
        var that = this, element = this.element, o = this.options;

        Metro.checkRuntime(element, "counter");

        Utils.exec(o.onCounterCreate, [element], this.elem);
        element.fire("countercreate");

        if (o.startOnViewport !== true) {
            this.start();
        }

        if (o.startOnViewport === true) {
            if (Utils.inViewport(element[0]) && !this.started) {
                this.start();
            }

            $.window().on("scroll", function(){
                if (Utils.inViewport(element[0]) && !that.started) {
                    that.start();
                }
            }, {ns: this.id})
        }
    },

    start: function(){
        var element = this.element, o = this.options;

        this.started = true;

        Utils.exec(o.onStart, null, element[0]);
        element.fire("start");

        element.animate({
            draw: {
                innerHTML: [0, +o.value]
            },
            defer: o.timeout,
            dur: o.duration,
            onFrame: function () {
                Utils.exec(o.onTick, [+this.innerHTML], element[0]);
                element.fire("tick", {
                    value: +this.innerHTML
                });
                this.innerHTML = Number(this.innerHTML).format(0, 0, o.delimiter)
            },
            onDone: function(){
                Utils.exec(o.onStop, null, element[0]);
                element.fire("stop");
            }
        })
    },

    reset: function(){
        this.started = false;
        this.element.html(this.html);
    },

    setValueAttribute: function(){
        this.options.value = this.element.attr("data-value");
    },

    changeAttribute: function(attributeName){
        if (attributeName === "data-value") {
            this.setValueAttribute();
        }
    },

    destroy: function(){
        if (this.options.startOnViewport === true) {
            $.window().off("scroll", {ns: this.id});
        }
        return this.element;
    }
};

Metro.plugin('counter', Counter);