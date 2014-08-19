/*globals trip, Sly*/
"use strict";

trip.controller("TripNewCtrl", ["$scope", "$rootScope", "$state", "AuthService", "ShipService", "TripEditService", "SHIP_SEL", "ShipSelService", function ($scope, $rootScope, $state, AuthService, ShipService, TripEditService, SHIP_SEL, ShipSelService) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $state.go("login");
    return;
  }

  $scope.$on("lastCaldrDay", function () {
    if ($scope.sly) {
      $scope.sly.reload();
    } else {
      var slyOptions = {
        horizontal: 1,
        // Item based navigation
        itemNav: "forceCentered",
        smart: 1,
        activateMiddle: 1,
        startAt: 0,
        // Scrolling
        scrollBy: 1,
        // Dragging
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        elasticBounds: 1,
        // Mixed options
        speed: 300,
        easing: "easeOutCubic"
      };
      $scope.sly = new Sly("#shipCaldr", slyOptions).init();
      $scope.sly.on("active", function (eventName, itemIndex) {
        TripEditService.selDate(itemIndex);
        $scope.$digest();
      });
    }
  });

  $rootScope.$on("shipSel", function (event, shipSel, selId) {
    TripEditService.setShipSel(shipSel, selId);
  });

  this.setShipSel = function (shipSel, selId) {
    TripEditService.setShipSel(shipSel, selId);
  };

  $scope.selMyShips = function () {
    TripEditService.setShipSel(SHIP_SEL.mine);
  };

  $scope.lookupShip = function () {
    ShipSelService.setShipSel(TripEditService.shipSel, TripEditService.selId);
    $rootScope.go("lookupShip");
  };

  $scope.selToday = function () {
    $scope.sly.activate(0);
  };

  $scope.setTimeFrom = function (timeFrom) {
    TripEditService.setTimeFrom(timeFrom);
  };

  $scope.decTimeFrom = function (delta) {
    TripEditService.decTimeFrom(delta);
  };

  $scope.incTimeFrom = function (delta) {
    TripEditService.incTimeFrom(delta);
  };

  $scope.setTimeTo = function (timeTo) {
    TripEditService.setTimeTo(timeTo);
  };

  $scope.decTimeTo = function (delta) {
    TripEditService.decTimeTo(delta);
  };

  $scope.incTimeTo = function (delta) {
    TripEditService.incTimeTo(delta);
  };

  $scope.setDuration = function (dur) {
    TripEditService.setDuration(dur);
  };

  $scope.trip = TripEditService;

}]);


trip.controller("TripMdfCtrl", ["$scope", "$state", "$stateParams", "AuthService", "ShipService", "TripService", function ($scope, $state, $stateParams, AuthService, ShipService, TripService) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $state.go("login");
    return;
  }

  $scope.trip = TripService.getTrip($stateParams.tripId);
  $scope.myShips = ShipService.getAllShips();

}]);
