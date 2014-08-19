/*globals angular, ships */
"use strict";

ships.controller("ShipListCtrl", ["$scope", "$state", "AuthService", "ShipService", "ShipListService", function ($scope, $state, AuthService, ShipService, ShipListService) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $state.go("login");
    return;
  }

  $scope.isLookup = false;

  $scope.listInfo = {
    sel: "my",
    searchText: ""
  };

  $scope.ships = ShipService;
  $scope.list = ShipListService;

}]);


ships.controller("ShipLookupCtrl", ["$scope", "$rootScope", "$state", "AuthService", "ShipService", "ShipListService", "ShipSelService", "SHIP_SEL", function ($scope, $rootScope, $state, AuthService, ShipService, ShipListService, ShipSelService, SHIP_SEL) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $state.go("login");
    return;
  }

  $scope.isLookup = true;

  $scope.listInfo = {
    sel: "my"
  };

  $scope.ships = ShipService;
  $scope.list = ShipListService;
  $scope.SHIP_SEL = SHIP_SEL;
  $scope.sel = ShipSelService;

  $scope.isSel = function (selKind, selId) {
    return ShipSelService.isSel(selKind, selId);
  };

  $scope.selIcon = function (selKind, selId) {
    if (ShipSelService.isSel(selKind, selId)) {
      return "ok";
    }
    if (ShipSelService.hasSel(selKind, selId)) {
      return "check";
    }
    return "unchecked";
  };

  $scope.selMine = function () {
    ShipSelService.setShipSel(SHIP_SEL.mine);
  };

  $scope.selLake = function (lakeId, evt) {
    ShipSelService.setShipSel(SHIP_SEL.lake, lakeId);
    evt.preventDefault();
    evt.stopPropagation();
  };

  $scope.selHarbor = function (harborId) {
    ShipSelService.setShipSel(SHIP_SEL.harbor, harborId);
  };

  $scope.selShip = function (shipId) {
    ShipSelService.setShipSel(SHIP_SEL.ship, shipId);
  };

  $scope.doCancel = function () {
    $rootScope.go($rootScope.previousState);
  };

  $scope.doOK = function () {
    $rootScope.$broadcast("shipSel", ShipSelService.shipSel, ShipSelService.selId);
    $rootScope.go($rootScope.previousState);
  };

}]);
