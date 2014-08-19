/*globals angular*/
"use strict";

var app = angular.module("app", [
  "ngAnimate",
  "ui.router",
  "session",
  "ships",
  "trips",
  "ship",
  "trip"
]);


app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise("/login");

  // Now set up the states
  $stateProvider
    .state("login", {
      url: "/login",
      templateUrl: "session/login.tpl.html",
      controller: "SessionCtrl"
    })
    .state("ships", {
      url: "/ships",
      templateUrl: "ships/ships.tpl.html",
      controller: "ShipListCtrl"
    })
    .state("ship", {
      url: "/ship/:shipId",
      templateUrl: "ship/ship.tpl.html",
      controller: "ShipDetailCtrl"
    })
    .state("trips", {
      url: "/trips",
      templateUrl: "trips/trips.tpl.html",
      controller: "TripListCtrl"
    })
    .state("tripNew", {
      url: "/trip/new",
      templateUrl: "trip/trip.tpl.html",
      controller: "TripNewCtrl"
    })
    .state("lookupShip", {
      url: "/lookupShip",
      templateUrl: "ships/ships.tpl.html",
      controller: "ShipLookupCtrl"
    })
    .state("tripMdf", {
      url: "/trip/:tripId",
      templateUrl: "trip/trip.tpl.html",
      controller: "TripMdfCtrl"
    });

}]);

