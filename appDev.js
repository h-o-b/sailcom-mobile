/*globals angular*/
"use strict";

var devApp = angular.module("devApp", ["app", "ngMockE2E"]);

devApp.service("TestData", ["$http", "SessionService", function ($http, SessionService) {

  var that = this;

  this.sessionInfo = null;
  this.lakes = null;
  this.harbors = null;
  this.ships = null;
  this.myTrips = null;
  this.trips = {};

  $http.get("data/login.json").then(function (data) {
    that.sessionInfo = data.data;
  });
  $http.get("data/lakes.json").then(function (data) {
    that.lakes = data.data;
  });
  $http.get("data/harbors.json").then(function (data) {
    that.harbors = data.data;
  });
  $http.get("data/ships.json").then(function (data) {
    that.ships = data.data;
  });
  $http.get("data/trips.json").then(function (data) {
    that.myTrips = data.data;
  });
  $http.get("data/trips112.json").then(function (data) {
    that.trips[112] = data.data;
  });
  $http.get("data/trips120.json").then(function (data) {
    that.trips[120] = data.data;
  });
  $http.get("data/trips143.json").then(function (data) {
    that.trips[143] = data.data;
  });
  $http.get("data/trips161.json").then(function (data) {
    that.trips[161] = data.data;
  });

  return this;

}]);


devApp.config(["$provide", function ($provide) {
  // delay mock backend responses by 1 second
  var DELAY_MS = 700;
  $provide.decorator("$httpBackend", function ($delegate) {
    var proxy = function (method, url, data, callback, headers) {
      var interceptor = function () {
        var _this = this, _arguments = arguments;
        if (url.match(/.tpl.html$/) != null || url.match(/^data\/.+\.json/) != null || url.indexOf(SessionService.API_BASE_URL + "/login") == 0) {
          callback.apply(this, arguments);
        } else if (url == SessionService.API_BASE_URL + "/lakes" || url == SessionService.API_BASE_URL + "/harbors" || url == SessionService.API_BASE_URL + "/ships" || url == SessionService.API_BASE_URL + "/trips") {
          callback.apply(this, arguments);
        } else {
          setTimeout(function () {
            callback.apply(_this, _arguments); // return result to the client AFTER delay
          }, DELAY_MS);
        }
      };
      return $delegate.call(this, method, url, data, interceptor, headers);
    };
    for (var key in $delegate) {
      proxy[key] = $delegate[key];
    }
    return proxy;
  });
}]);


devApp.run(["$httpBackend", "TestData", function ($httpBackend, TestData) {

  /* Partials are OK */
  $httpBackend.whenGET(/.tpl.html$/).passThrough();

  /* Testdata are OK */
  $httpBackend.whenGET(/^data\/.+\.json/).passThrough();

  /* Test Login */
  $httpBackend.whenGET(SessionService.API_BASE_URL + "/session/login?user=test&pwd=test").respond(function (method, url, data) {
    return [200, TestData.sessionInfo, {}];
  });

  /* Lakes */
  $httpBackend.whenGET(SessionService.API_BASE_URL + "/lakes").respond(function (method, url, data) {
    return [200, TestData.lakes, {}];
  });

  /* Harbors */
  $httpBackend.whenGET(SessionService.API_BASE_URL + "/harbors").respond(function (method, url, data) {
    return [200, TestData.harbors, {}];
  });

  /* Ships */
  $httpBackend.whenGET(SessionService.API_BASE_URL + "/ships").respond(function (method, url, data) {
    return [200, TestData.ships, {}];
  });

  /* Trips */
  $httpBackend.whenGET(SessionService.API_BASE_URL + "/trips").respond(function (method, url, data) {
    return [200, TestData.myTrips, {}];
  });

  /* Trips of Ship 112 */
  $httpBackend.whenGET(/\/bookings\?shipId=112&nofWeeks=/).respond(function (method, url, data) {
    return [200, TestData.trips[112], {}];
  });

  /* Trips of Ship 120 */
  $httpBackend.whenGET(/\/bookings\?shipId=120&nofWeeks=/).respond(function (method, url, data) {
    return [200, TestData.trips[120], {}];
  });

  /* Trips of Ship 143 */
  $httpBackend.whenGET(/\/bookings\?shipId=143&nofWeeks=/).respond(function (method, url, data) {
    return [200, TestData.trips[143], {}];
  });

  /* Trips of Ship 161 */
  $httpBackend.whenGET(/\/bookings\?shipId=161&nofWeeks=/).respond(function (method, url, data) {
    return [200, TestData.trips[161], {}];
  });

}]);

