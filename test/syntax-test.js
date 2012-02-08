var buster = require("buster");
var syntax = require("../lib/buster-syntax").syntax;

buster.testCase("Syntax", {
    "passes syntactically valid code": function () {
        assert(syntax.create().check("var a = 42;").ok);
    },

    "passes syntactically valid code with file name": function () {
        assert(syntax.create().check("var a = 42;", "booya.js").ok);
    },

    "fails syntactically invalid code": function () {
        var result = syntax.create().check("va a = 42;");
        refute(result.ok);
        assert.match(result.toString(), "Unexpected token");
        assert.equals(result.type, syntax.SYNTAX_ERROR);
    },

    "formats syntax error nicely": function () {
        var result = syntax.create().check("va a = 42;");

        assert.match(result.toString(), "[anonymous]:1:4\nva a = 42;\n" +
                     "   ^\nUnexpected token: name (a)\n");
    },

    "formats syntax error with file name": function () {
        var result = syntax.create().check("va a = 42;", "omg.js");

        assert.match(result.toString(), "omg.js:1:4");
    },

    "recognizes browser globals": function () {
        assert(syntax.create().check("document.createElement('div');").ok);
    },

    "recognizes globals introduced by previously loaded script": function () {
        var checker = syntax.create();
        checker.check("jQuery = function () {};");
        assert(checker.check("var a = jQuery('div');").ok);
    },

    "does not recognize undefined globals": function () {
        var checker = syntax.create();
        checker.check("jQuery = function () {};");
        var result = checker.check("var a = $('div');");
        refute(result.ok);
        assert.equals(result.type, syntax.REFERENCE_ERROR);
    },

    "ignores reference errors": function () {
        var checker = syntax.create({ ignoreReferenceErrors: true });
        var result = checker.check("var a = $('div');");
        assert(result.ok);
    }
});
