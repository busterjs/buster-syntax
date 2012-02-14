var syntax = require("./syntax");

function processor(analyzer, resource, content) {
    var result = this.checker.check(content, resource.path);
    if (!result.ok) {
        var path = resource.path;
        if (result.type === syntax.SYNTAX_ERROR) {
            analyzer.fatal("Syntax error in " + path, result);
        } else {
            analyzer.error("ReferenceError in " + path, result);
        }
    }
}

module.exports = {
    name: "buster-syntax",

    create: function (options) {
        var instance = Object.create(this);
        instance.checker = syntax.create({
            ignoreReferenceErrors: options && options.ignoreReferenceErrors
        });
        return instance;
    },

    beforeRun: function (config, analyzer) {
        ["libs", "sources", "testLibs", "tests"].forEach(function (group) {
            config.on("load:" + group, function (resourceSet) {
                resourceSet.addProcessor(processor.bind(this, analyzer));
            }.bind(this));
        }.bind(this));
    }
};
