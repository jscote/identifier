/**
 * Created by jean-sebastiencote on 1/24/15.
 */

var base = require('../index.js');

module.exports = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    placeholder: function (test) {
        var x = base.SupportedTypes.addType("something", "smti");
        test.ok(true);
        test.done();
    },
    supportedTypes_whenCallGetWithValidType_returnsAType : function(test) {

        base.SupportedTypes.getType('something').then(function(type){

            test.ok(type.identifierType == 'something');
            test.done();
        });
    }
};
