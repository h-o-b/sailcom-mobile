/*globals angular, session*/
"use strict";

session.controller("SessionCtrl", ["$scope", "$rootScope", "$location", "AUTH_EVENTS", "AuthService", "SessionService", "ShipService", "TripService", function ($scope, $rootScope, $location, AUTH_EVENTS, AuthService, SessionService, ShipService, TripService) {

  $scope.isAuthenticated = AuthService.isAuthenticated();

  if ($scope.isAuthenticated) {
    $scope.userInfo = {
      userId: SessionService.user.id,
      pwd: ""
    };
  } else {
    $scope.userInfo = {
      userId: "",
      pwd: ""
    };
  }

  $scope.login = function (userInfo) {
    AuthService.login(userInfo).then(function () {
      $scope.setCurrentUser(SessionService.user);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      ShipService.create()
        .then(function () {
          TripService.create()
            .then(function () {
              $location.url("/trips");
            });
        });
    }, function () {
      $scope.setCurrentUser(null);
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };

  $scope.logout = function () {
    AuthService.logout()
      .then(function () {
        $scope.setCurrentUser(null);
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        window.location.reload();
      }, function () {
        $scope.setCurrentUser(null);
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        window.location.reload();
      });
  };

}]);
