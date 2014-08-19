/*globals app*/
"use strict";

app.controller("AppCtrl", ["$scope", "$rootScope", "$window", "$state", "AuthService", "USER_ROLES", "ShipSelService", "SHIP_SEL", "TripEditService", "BookListService", function ($scope, $rootScope, $window, $state, AuthService, USER_ROLES, ShipSelService, SHIP_SEL, TripEditService, BookListService) {

  $scope.userRoles = USER_ROLES;

  $scope.currentUser = null;
  $scope.isAuthenticated = AuthService.isAuthenticated;
  $scope.isAuthorized = AuthService.isAuthorized;

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  };

  $scope.openNewTrip = function () {
    TripEditService.setShipSel(SHIP_SEL.mine);
    TripEditService.selDate(0);
    $rootScope.go("tripNew");
  };

  $rootScope.previousState = null;
  $rootScope.currentState = null;
  $rootScope.pageAnimationClass = null;

  $rootScope.$on("$stateChangeSuccess", function (evt, to, toParams, from, fromParams) {
    $rootScope.previousState = from.name;
    $rootScope.currentState = to.name;
  });

  $rootScope.pathIndexMap = {
    "login" : 1,
    "ships" : 11,
    "ship" : 12,
    "trips" : 21,
    "trip" : 22,
    "tripNew" : 23,
    "lookupShip" : 99
  };

  $rootScope.pageAnimationDir = function (from, to) {
    return $rootScope.pathIndexMap[to] - $rootScope.pathIndexMap[from];
  };

  $rootScope.go = function (state) {
    $rootScope.pageAnimationClass = ($rootScope.pageAnimationDir(this.currentState, state) > 0) ? "slide-to-left" : "slide-to-right";
    if (state === "back") { // Allow a "back" keyword to go to previous page
      $window.history.back();
    } else { // Go to the specified path
      $state.go(state);
    }
  };

}]);


app.controller("SpinnerCtrl", ["$scope", "$http", function ($scope, $http) {
  $scope.hasPendingRequests = function () {
    return $http.pendingRequests.length > 0;
  };
}]);

