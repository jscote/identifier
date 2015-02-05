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
    },
    identifiers_exists_withValidId_willReturnTrue: function (test) {
        base.Identifiers.identifierExists('smtg-0470126e-31d7-4f81-bc11-05381c40f90e').then(function (doesExist) {
            test.ok(doesExist, 'should exist');
            test.done();
        });
    },
    identifiers_exists_withInvalidId_willReturnFalse: function (test) {
        base.Identifiers.identifierExists('blah').then(function (doesExist) {
            test.ok(!doesExist, 'should not exist');
            test.done();
        });
    },
    configuration_withInvalidConnection_willNotAllowToWork: function (test) {

        base.Configuration({connectionConfiguration: {host: "invalidHost"}});

        base.Identifiers.identifierExists("something").then(function () {
            test.ok(false);
            test.done();
        }).fail(function (error) {
            test.ok(error.message == "No Living connections");
            test.ok(true);
            test.done();
        });
    },
    configuration_withValidConnection_willWork: function (test) {

        base.Configuration({connectionConfiguration: {host: "localhost:9200"}});

        base.Identifiers.identifierExists("something").then(function () {
            test.ok(true);
            test.done();
        }).fail(function (error) {
            test.ok(error.message == "No Living connections");
            test.ok(false);
            test.done();
        });
    },
    configuration_withSupportedTypes_willWork: function (test) {
        base.Configuration({
            connectionConfiguration: {host: "localhost:9200"},
            supportedTypes: [{supportedType: "something", abbreviation: "smtg"}]
        }).then(function () {
            test.ok(true);
            test.done();
        }).fail(function () {
            test.ok(false);
            test.done();
        });
    },
    configuration_withOneSupportedTypes_willWork: function (test) {
        base.Configuration({
            connectionConfiguration: {host: "localhost:9200"},
            supportedTypes: {supportedType: "something", abbreviation: "smtg"}
        }).then(function () {
            test.ok(true);
            test.done();
        }).fail(function () {
            test.ok(false);
            test.done();
        });
    },
    configuration_withInvalidSupportedTypes_willNotWork: function (test) {
        base.Configuration({
            connectionConfiguration: {host: "localhost:9200"},
            supportedTypes: ""
        }).then(function () {
            test.ok(false);
            test.done();
        }).fail(function () {
            test.ok(true);
            test.done();
        });
    }

};
