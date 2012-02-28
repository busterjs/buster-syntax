var vm = require("vm");
var jsp = require("uglify-js").parser;
var jsdom;

try {
    jsdom = require("jsdom").jsdom;
} catch (e) {
    // No worries, jsdom is optional
    jsdom = function () { return {}; };
}

function spaces(num) {
    var str = "";
    while (num--) { str += " "; }
    return str;
}

function tabsUntil(line, col) {
    var i, num = 0;
    for (i = 0; i < col; ++i) {
        if (/\t/.test(line.substr(i, 1))) {
            num += 1;
        }
    }
    return num;
}

var refErrRegExp = /ReferenceError: (.*) is not defined/;

function getType(error) {
    var s = module.exports;
    return refErrRegExp.test(error) ? s.REFERENCE_ERROR : s.SYNTAX_ERROR;
}

var result = {
    create: function (error, script, fileName) {
        var instance = Object.create(this);
        instance.originalError = error;
        instance.ok = !error;
        instance.type = getType(error);
        instance.error = error;
        instance.script = script;
        instance.fileName = fileName;
        return instance;
    },

    details: function () {
        try {
            jsp.parse(this.script);
            return this.originalError;
        } catch (e) {
            return e;
        }
    },

    format: function () {
        var fileName = this.fileName || "[anonymous]";
        var e = this.details();
        var str = fileName;

        if (e.line) {
            str += ":" + e.line + ":" + e.col + "\n";
            var line = this.script.split("\n")[e.line - 1];
            str += line.replace(/\t/g, "    ") + "\n";
            str += spaces(e.col - 1 + (tabsUntil(line, e.col) * 4)) + "^\n";
        }

        str += e.message + "\n";
        return str;
    },

    toString: function () {
        return this.format();
    }
};

module.exports = {
    SYNTAX_ERROR: "Syntax error",
    REFERENCE_ERROR: "ReferenceError",

    create: function (options) {
        options = options || {};
        var markup = "<!DOCTYPE html><html><head></head><body></body></html>";
        var dom = jsdom(markup);
        var instance = Object.create(this);
        instance.context = {
            setTimeout: setTimeout,
            setInterval: setInterval,
            clearTimeout: clearTimeout,
            clearInterval: clearInterval,
            window: dom.createWindow && dom.createWindow()
        };

        if (instance.context.window) {
            var prop;
            for (prop in instance.context.window) {
                instance.context[prop] = instance.context.window[prop];
            }
            instance.ignoreReferenceErrors = options.ignoreReferenceErrors || false;
        } else {
            instance.ignoreReferenceErrors = true;
        }

        return instance;
    },

    check: function (script, file) {
        try {
            var check = script;
            if (this.ignoreReferenceErrors) {
                check = "(function () {" + script + "})";
            }
            vm.runInNewContext(check, this.context);
            return { ok: true };
        } catch (e) {
            return result.create(e, script, file);
        }
    }
};
