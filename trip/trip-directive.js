/*globals trip*/
"use strict";

trip.directive("caldrDay", ["$timeout", "TripEditService", function ($timeout, TripEditService) {
  return {
    scope: {
      day: "="
    },
    templateUrl: "trip/caldr-day.tpl.html",
    link: function (scope, element, attrs, controller) {

      scope.getShipList = function () {
        return TripEditService.getShipList();
      };

      if (scope.$parent.$last) {
        $timeout(function () {
          scope.$emit('lastCaldrDay');
        });
      }

    }
  };
}]);


trip.directive("caldrTrip", ["TripEditService", "ShipSelService", "SHIP_SEL", "BookListService", function (TripEditService, ShipSelService, SHIP_SEL, BookListService) {
  return {
    scope: {
      ship: "=",
      day: "="
    },
    templateUrl: "trip/caldr-trip.tpl.html",
    link: function (scope, element, attrs, controller) {

      scope.isLoading = function (shipId) {
        return BookListService.isLoading(shipId);
      };

      scope.getShipSel = function () {
        return TripEditService.getShipSel();
      };

      scope.getShipList = function () {
        return TripEditService.getShipList();
      };

      scope.selShip = function (shipId) {
        if (TripEditService.getShipSel() === SHIP_SEL.ship) {
          TripEditService.setShipSel(ShipSelService.shipSel, ShipSelService.selId);
        } else {
          TripEditService.setShipSel(SHIP_SEL.ship, shipId);
        }
      };

      scope.getBookList = function () {
        return BookListService.getBookList(scope.day.tripDate, scope.ship.id);
      };

      scope.hasCurrBook = function (tripDate) {
        return +tripDate === +TripEditService.getSelDate() && !!TripEditService.vDuration;
      };

      scope.currBookTimeFrom = function () {
        return TripEditService.vTimeFrom;
      };

      scope.currBookTimeTo = function () {
        return TripEditService.vTimeTo;
      };

      scope.currBookDuration = function () {
        return Math.min(TripEditService.vTimeTo, 42) - Math.max(TripEditService.vTimeFrom, 18);
      };

      scope.currBookDurationText = function () {
        return TripEditService.vTimeFrom ? TripEditService.timeFrom + " - " + TripEditService.timeTo : "";
      };

      scope.hasBookClash = function (tripDate, shipId) {
        return BookListService.hasBookClash(tripDate, shipId);
      };

    }
  };
}]);

