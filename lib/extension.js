var syntax = require("./syntax");

module.exports = {
    create: function (options) {
        var instance = Object.create(this);
        instance.checker = syntax.create({
            ignoreReferenceErrors: options && options.ignoreReferenceErrors
        });
        return instance;
    },

    beforeRun: function (resourceSet, analyzer) {
        resourceSet.addProcessor(function (resource, content) {
            var result = this.checker.check(content, resource.path);
            if (!result.ok) {
                var path = resource.path;
                if (result.type === syntax.SYNTAX_ERROR) {
                    analyzer.fatal("Syntax error in " + path, result);
                } else {
                    analyzer.error("ReferenceError in " + path, result);
                }
            }
        }.bind(this));
    }
};
