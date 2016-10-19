/*globals angular, trips*/
"use strict";

trips.service("TripService", ["$http", "$q", "$rootScope", "SessionService", "ShipService", function ($http, $q, $rootScope, SessionService, ShipService) {

  this.myTripList = null;
  this.tripMap = null;

  this.init = function () {
    this.myTripList = [];
    this.tripMap = {};
  };

  this.create = function () {
    this.init();
    return this.getData();
  };

  this.getMyTrips = function () {
    return this.myTripList;
  };

  this.getTrip = function (tripId) {
    return this.tripMap[tripId];
  };

  this.getData = function () {
    var that = this;
    return $http
      .get(SessionService.API_BASE_URL + "/trips")
      .then(function (rsp) {
        that.myTripList = rsp.data;
        var tripCnt = that.myTripList.length, i, trip, ship;
        for (i = 0; i < tripCnt; i++) {
          trip = that.myTripList[i];
          that.tripMap[trip.id] = trip;
          ship = ShipService.getShip(trip.shipId);
          trip.lakeName = ship.lakeName;
          trip.harborName = ship.harborName;
          trip.shipName = ship.name;
          trip.dateFrom = new Date(Date.parse(trip.dateFrom));
          trip.dateTo = new Date(Date.parse(trip.dateTo));
        }
      });
  };

  this.destroy = function () {
    this.init();
  };

  return this;

}]);
