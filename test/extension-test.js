var buster = require("buster");
var ext = require("../lib/buster-syntax").extension;
var resourceSet = require("buster-resources").resourceSet;
var analyzer = require("buster-analyzer");

buster.testCase("Syntax extension", {
    setUp: function () {
        this.resourceSet = resourceSet.create();
        this.analyzer = analyzer.create();
        this.listeners = { fatal: this.spy(), error: this.spy() };
        this.analyzer.on("fatal", this.listeners.fatal);
        this.analyzer.on("error", this.listeners.error);
    },

    "adds processor to resource set": function () {
        var syntax = ext.create();
        this.spy(this.resourceSet, "addProcessor");
        syntax.beforeRun(this.resourceSet, this.analyzer);

        assert.calledOnce(this.resourceSet.addProcessor);
    },

    "flags fatal on syntax error": function (done) {
        var syntax = ext.create();
        syntax.beforeRun(this.resourceSet, this.analyzer);

        this.resourceSet.addResource({
            path: "/buster.js",
            content: "va a = 42;"
        }).then(function (resource) {
            resource.content().then(done(function (content) {
                assert.calledOnce(this.listeners.fatal);
                assert.calledWith(this.listeners.fatal,
                                  "Syntax error in /buster.js");
            }.bind(this)));
        }.bind(this));
    },

    "flags error on reference error": function (done) {
        var syntax = ext.create();
        syntax.beforeRun(this.resourceSet, this.analyzer);

        this.resourceSet.addResource({
            path: "/buster.js",
            content: "var a = $('div');"
        }).then(function (resource) {
            resource.content().then(done(function (content) {
                assert.calledOnce(this.listeners.error);
                assert.calledWith(this.listeners.error,
                                  "ReferenceError in /buster.js");
            }.bind(this)));
        }.bind(this));
    },

    "skips reference error if configured thusly": function (done) {
        var syntax = ext.create({ ignoreReferenceErrors: true });
        syntax.beforeRun(this.resourceSet, this.analyzer);

        this.resourceSet.addResource({
            path: "/buster.js",
            content: "var a = $('div');"
        }).then(function (resource) {
            resource.content().then(done(function (content) {
                refute.called(this.listeners.error);
            }.bind(this)));
        }.bind(this));
    }
});
