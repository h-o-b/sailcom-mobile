/*globals trips*/
"use strict";

trips.controller("TripListCtrl", ["$scope", "$state", "AuthService", "TripService", function ($scope, $state, AuthService, TripService) {

  // TODO: Prevent coming here in the first place by blocking route
  if (!AuthService.isAuthenticated()) {
    $state.go("login");
    return;
  }

  $scope.trips = TripService.getMyTrips();

  $scope.showTrip = function (trip) {
    $state.go("tripMdf", { tripId: trip.id });
  };

}]);
