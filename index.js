/**
 * Created by jean-sebastiencote on 2/2/15.
 */
(function (_, q, es) {

    'use strict';

    var generateUUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var internalTypes = {};

    var supportedTypes = function SupportedTypes() {
    };

    supportedTypes.addType = function (type, abbreviation) {
        if (!_.isString(type)) throw Error("type is not a string");
        if (!_.isString(abbreviation)) throw Error("abbreviation is not a string");
        if (abbreviation.length > 4) throw Error("abbreviation should not be more than 4 characters");

        var client = new es.Client({
            host: 'localhost:9200'
        });

        var parameters = {index: 'identifiers', type: 'supportedType', id: type};

        if (_.isUndefined(internalTypes[type])) {
            //Check if it exists in Elastic Search.
            //if so, return it, and add it to our internal cache
            client.get(parameters).then(function (response) {
                console.log(response);
                internalTypes[response._source.identifierType] = response._source.abbreviation;
                client.close();
            }).catch(function (error) {
                if (error.status == 404) {
                    //before adding, make sure the abbreviation doesn't exist
                    client.search({
                        index: 'identifiers',
                        type: 'supportedType',
                        ignore: 404,
                        body: {query: {filtered: {filter: {term: {abbreviation: abbreviation}}}}}

                    }).then(function (response) {
                        console.log(response);
                        if(response.hits.total == 0) {
                            client.create({
                                index: 'identifiers',
                                type: 'supportedType',
                                id: type,
                                body : {identifierType: type, abbreviation: abbreviation}
                            }).then(function () {
                                internalTypes[type] = abbreviation;
                                client.close();
                            }).catch(function(error) {
                                console.log(error);
                                client.close();
                            });
                        } else {
                            throw Error("Abbreviation Already Exist");
                        }
                        client.close();
                    }).catch(function (error) {
                        console.log(error);
                        client.close();
                    });

                }
            });

        }

    };

    supportedTypes.getType = function (type) {
        if (!_.isString(type)) throw Error("type is not a string");
        if (!_.isUndefined(internalTypes[type])) return {identifierType: type, abbreviation: internalTypes[type]};

        var dfd = q.defer();

        var client = new es.Client({
            host: 'localhost:9200'
        });

        var parameters = {index: 'identifiers', type: 'supportedType', id: type};
        client.get(parameters).then(function (response) {
            internalTypes[response._source.identifierType] = response._source.abbreviation;
            dfd.resolve({identifierType: type, abbreviation: internalTypes[type]});
        }).catch(function (error) {
            dfd.reject(error);
        }).finally(function () {
            client.close();
        });

        return dfd.promise;

    };

    module.exports.SupportedTypes = supportedTypes;


})(require('lodash'), require('q'), require('elasticsearch'));