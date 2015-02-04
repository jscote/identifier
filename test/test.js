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
    supportedTypes_whenCallGetWithValidType_returnsAType: function (test) {

        base.SupportedTypes.getType('something').then(function (type) {

            test.ok(type.identifierType == 'something');
            test.done();
        });
    },
    identifiers_getNextId_whenCalledWithExistingType_returnsANewId: function (test) {

        base.Identifiers.getNextId("something").then(function (id) {
            console.log(id);
            test.ok(id);
            test.done();
        });
    },
    identifiers_getNextId_whenCalledWithInvalidType_willBeRejected: function (test) {
        base.Identifiers.getNextId("inexistingType").then(function (id) {
            test.ok(false);
            test.done();
        }).fail(function (error) {
            test.ok(error == 'Unsupported type');
            test.ok(true);
            test.done();
        });
    },
    identifiers_getNextId_whenCalledASecondTime_ValueComesFromCache: function (test) {
        base.Identifiers.getNextId("something").then(function (id) {
            console.log(id);
            base.Identifiers.getNextId("something").then(function (id) {
                console.log(id);
                test.ok(id);
                test.done();
            });
        });


    }

};
