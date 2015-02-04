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
                        if (response.hits.total == 0) {
                            client.create({
                                index: 'identifiers',
                                type: 'supportedType',
                                id: type,
                                body: {identifierType: type, abbreviation: abbreviation}
                            }).then(function () {
                                internalTypes[type] = abbreviation;
                                client.close();
                            }).catch(function (error) {
                                console.log(error);
                                client.close();
                            });
                        } else {
                            client.close();
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

        var dfd = q.defer();
        if (!_.isUndefined(internalTypes[type])) {
            dfd.resolve({identifierType: type, abbreviation: internalTypes[type]});
            return dfd.promise;
        }


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

    var maxCacheSize = 10;
    var cachedIdentifiers = {};
    var identifiers = function () {
    };

    function resolveId(supportedType, dfd) {
        var idToReturn = cachedIdentifiers[supportedType].splice(0, 1);
        if (idToReturn.length > 0) {
            dfd.resolve(idToReturn[0]._id);
        } else {
            dfd.reject('No more id to retrieve');
        }
    }

    identifiers.getNextId = function (type) {

        var dfd = q.defer();

        supportedTypes.getType(type).then(function (supportedType) {

            if (_.isUndefined(cachedIdentifiers[supportedType])) {
                cachedIdentifiers[supportedType] = [];
            }

            if (cachedIdentifiers[supportedType].length == 0) {
                //Fill in the cache

                var promises = [];

                var client = new es.Client({host: 'localhost:9200'});

                try {
                    for (var i = 0; i < maxCacheSize; i++) {
                        (function (p, id) {
                            p.push(client.create({
                                index: 'identifiers',
                                type: 'identifier',
                                id: id,
                                body: {identifier: id}
                            }));
                        })(promises, supportedType.abbreviation + '-' + generateUUID());
                    }

                    q.all(promises).then(function (ids) {
                        cachedIdentifiers[supportedType] = ids;
                        resolveId(supportedType, dfd);
                    }).catch(function (error) {
                        console.log(error);
                    }).finally(function(){
                        client.close();
                    });
                }
                catch(e) {
                    dfd.reject(e);
                }

            } else {
                resolveId(supportedType, dfd);
            }


        }).catch(function () {
            dfd.reject("Unsupported type")
        });

        return dfd.promise;

    };

    module.exports.SupportedTypes = supportedTypes;
    module.exports.Identifiers = identifiers;


})(require('lodash'), require('q'), require('elasticsearch'));