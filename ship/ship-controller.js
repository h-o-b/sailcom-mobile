/*globals angular, ship*/
"use strict";

ship.controller("ShipDetailCtrl", ["$scope", "$location", "AuthService", "ShipService", function ($scope, $location, AuthService, ShipService) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $location.url("/login");
    return;
  }

  $scope.ship = ShipService.getShip(123);

}]);
