/*globals $, angular, trip*/
"use strict";

trip.service("BookListService", ["$http", "$filter", function ($http, $filter) {

  /* Current Booking */
  this.currBookDate = null;
  this.currBookTimeFrom = null;
  this.currBookTimeTo = null;

  this.setCurrentBooking = function (tripDate, timeFrom, timeTo) {
    this.currBookDate = tripDate;
    this.currBookTimeFrom = timeFrom;
    this.currBookTimeTo = timeTo;
  };

  /* Booking List */
  this.vTime = function (time) {
    return 2.0 * time.substr(0, 2) + (time.substr(3, 2) === "00" ? 0 : 1);
  };

  this.realTime = function (vTime) {
    if (vTime === null || vTime === undefined) {
      return "";
    }
    var hour = Math.floor(vTime / 2);
    hour = hour < 10 ? "0" + hour : hour.toString();
    return hour + ":" + (vTime % 2 === 0 ? "00" : "30");
  };

  this.realDuration = function (vDur) {
    if (!vDur) {
      return "";
    }
    return Math.floor(vDur / 2) + (vDur % 2 === 0 ? "" : ":30") + "h";
  };

  var bookTempl = {
    vTimeFrom: null,
    vTimeTo: null,
    timeFrom: null,
    timeTo: null,
    isOther: false,
    isMine: false,
    isNew: false
  };

  this.genBook = function (bookInfo) {
    return $.extend($.extend({}, bookTempl), bookInfo);
  };

  this.genDateBookList = function (tripDate, shipId, tripList) {
    var bookList = [], t, trip;
    for (t = 0; t < tripList.length; t++) {
      trip = tripList[t];
      if (+trip.tripDate === +tripDate) {
        bookList.push(this.genBook({ timeFrom: trip.bookTimeFrom, timeTo: trip.bookTimeTo, vTimeFrom: trip.vTimeFrom, vTimeTo: trip.vTimeTo, isOther: !trip.isMine, isMine: trip.isMine }));
      }
    }
    return bookList;
  };

  this.shipList = {};
  this.emptyBookList = [];

  this.getBookList = function (tripDate, shipId) {
    if (this.shipList[shipId].isLoading) {
      return this.emptyBookList;
    }
    var dateKey = $filter("date")(tripDate, "yyyy-MM-dd");
    var dateBookList = this.shipList[shipId].dateBookList;
    if (!dateBookList.hasOwnProperty(dateKey)) {
      dateBookList[dateKey] = this.genDateBookList(tripDate, shipId, this.shipList[shipId].allBookList);
    }
    return dateBookList[dateKey];
  };

  this.hasBookClash = function (tripDate, shipId) {
    if (!this.currBookDate || this.currBookTimeFrom === null || this.currBookTimeTo === null || (+this.currBookDate !== +tripDate)) {
      return false;
    }
    var bookList = this.getBookList(tripDate, shipId), i, book;
    for (i = 0; i < bookList.length; i++) {
      book = bookList[i];
      if (this.currBookTimeTo > book.vTimeFrom && this.currBookTimeFrom < book.vTimeTo) {
        return true;
      }
    }
    return false;
  };

  this.isLoading = function (shipId) {
    if (this.shipList.hasOwnProperty(shipId)) {
      return this.shipList[shipId].isLoading;
    }
    return true;
  };

  this.loadShipBookings = function (shipId, weekCount, firstDay, lastDay) {
    var that = this;
    $http
      .get("/sailcom-proxy/bookings?shipId=" + shipId + "&nofWeeks=" + weekCount)
      .then(function (rsp) {
        var i, book, parts;
        for (i = 0; i < rsp.data.length; i++) {
          book = rsp.data[i];
          parts = book.bookDate.split('-');
          book.tripDate = new Date(parts[0], parts[1] - 1, parts[2]);
          if ((firstDay <= book.tripDate) && (book.tripDate <= lastDay)) {
            book.vTimeFrom = that.vTime(book.bookTimeFrom);
            book.vTimeTo = that.vTime(book.bookTimeTo);
            that.shipList[shipId].allBookList.push(book);
          }
        }
        that.shipList[shipId].isLoading = false;
      }, function (rsp) {
        that.shipList[shipId].isLoading = false;
      });
  };

  this.loadBookings = function (ships, weekCount, firstDay, lastDay) {
    var i, ship;
    for (i = 0; i < ships.length; i++) {
      ship = ships[i];
      if (!this.shipList.hasOwnProperty(ship.id)) {
        this.shipList[ship.id] = {
          isLoading: true,
          allBookList: [],
          dateBookList: {}
        };
        this.loadShipBookings(ship.id, weekCount, firstDay, lastDay);
      }
    }
  };

  return this;

}]);


trip.service("TripEditService", ["$filter", "ShipService", "SHIP_SEL", "BookListService", function ($filter, ShipService, SHIP_SEL, BookListService) {

  /* Ship Selection */
  this.shipSel = null;  // SHIP_SEL (mine, lake, harbor, ship)
  this.selId = null;
  this.shipSelName = "";
  this.shipList = [];

  this.setShipSel = function (shipSel, selId) {
    this.shipSel = shipSel;
    if (shipSel === SHIP_SEL.mine) {
      this.shipSelName = "Meine Boote";
      this.selId = null;
      this.shipList = ShipService.getMyShips();
      if (this.shipList.length === 1) {
        this.setShipSel(SHIP_SEL.ship, this.shipList[0].id);
      }
    } else if (shipSel === SHIP_SEL.lake) {
      this.shipSelName = ShipService.getLake(selId).name;
      this.selId = selId;
      this.shipList = ShipService.getShipsForLake(selId);
    } else if (shipSel === SHIP_SEL.harbor) {
      this.shipSelName = ShipService.getHarbor(selId).name;
      this.selId = selId;
      this.shipList = ShipService.getShipsForHarbor(selId);
    } else if (shipSel === SHIP_SEL.ship) {
      this.shipSelName = ShipService.getShip(selId).name;
      this.selId = selId;
      this.shipList = [ ShipService.getShip(selId) ];
    } else {
      this.shipSel = null;
      this.shipSelName = "Keine Selektion";
      this.selId = null;
      this.shipList = [];
    }
    BookListService.loadBookings(this.shipList, Math.round(this.DAY_COUNT / 7 + 2), this.FIRST_DAY, this.LAST_DAY);
  };

  this.getShipSel = function () {
    return this.shipSel;
  };

  this.getSelId = function () {
    return this.selId;
  };

  this.isSel = function (shipSel, selId) {
    if (this.shipSel === shipSel && this.selId === selId) {
      return true;
    }
    if (this.shipSel === SHIP_SEL.mine) {
      return true;
    }
    if (shipSel === SHIP_SEL.ship) {
      if (this.shipSel === SHIP_SEL.lake) {
        return ShipService.getShip(selId).lakeId === this.selId;
      }
      if (this.shipSel === SHIP_SEL.harbor) {
        return ShipService.getShip(selId).harborId === this.selId;
      }
    }
    if (shipSel === SHIP_SEL.harbor) {
      if (this.shipSel === SHIP_SEL.lake) {
        return ShipService.getHarbor(selId).lakeId === this.selId;
      }
    }
    return false;
  };

  this.getLakeId = function () {
    if (this.shipSel === SHIP_SEL.lake) {
      return this.selId;
    }
    return null;
  };

  this.getHarborId = function () {
    if (this.shipSel === SHIP_SEL.harbor) {
      return this.selId;
    }
    return null;
  };

  this.getShipId = function () {
    if (this.shipSel === SHIP_SEL.ship) {
      return this.selId;
    }
    return null;
  };

  this.getShipList = function () {
    return this.shipList;
  };

  /* Date Selection */
  this.addDays = function (aDate, dayCount) {
    var d = new Date(aDate.valueOf());
    d.setDate(d.getDate() + dayCount);
    return d;
  };

  this.newDay = function (tripDate) {
    var day = {};
    day.tripDate = tripDate;
    day.isToday = +day.tripDate === +this.FIRST_DAY;
    day.isWeekend = day.tripDate.getDay() === 0 || day.tripDate.getDay() === 6;
    return day;
  };

  this.FIRST_DAY = new Date();
  this.FIRST_DAY.setHours(0, 0, 0, 0);
  this.DAY_COUNT = 14;
  this.LAST_DAY = this.addDays(this.FIRST_DAY, this.DAY_COUNT - 1);

  this.allDateList = [];
  this.currDate = null;

  var i;

  for (i = 0; i < this.DAY_COUNT; i++) {
    this.allDateList.push(this.newDay(this.addDays(this.FIRST_DAY, i)));
  }

  this.getDateList = function () {
    return this.allDateList;
  };

  this.getSelDate = function () {
    return this.currDate;
  };

  this.selDate = function (index) {
    this.currDate = this.allDateList[index].tripDate;
    BookListService.setCurrentBooking(this.getSelDate(), this.vTimeFrom, this.vTimeTo, this.shipList);
  };

  this.selDate(0);

  /* Time Range */
  this.vTimeFrom = null;
  this.timeFrom = "";
  this.vTimeTo = null;
  this.timeTo = "";
  this.vDuration = null;
  this.duration = "";

  this.calcRealTimeRange = function () {
    this.vDuration = this.vTimeTo - this.vTimeFrom;
    if (this.vDuration) {
      this.timeFrom = BookListService.realTime(this.vTimeFrom);
      this.timeTo = BookListService.realTime(this.vTimeTo);
      this.duration = BookListService.realDuration(this.vDuration);
    } else {
      this.timeFrom = "";
      this.timeTo = "";
      this.duration = "";
    }
    BookListService.setCurrentBooking(this.getSelDate(), this.vTimeFrom, this.vTimeTo, this.shipList);
  };

  this.clearTimeRange = function () {
    this.vTimeFrom = null;
    this.vTimeTo = null;
    this.vDuration = null;
    this.calcRealTimeRange();
  };

  this.selTimeRange = function (range) {
    this.vTimeFrom = 18 + 6 * (range - 1);
    this.vTimeTo = 24 + 6 * (range - 1);
    this.calcRealTimeRange();
  };

  this.setTimeFrom = function (timeFrom) {
    this.vTimeFrom = timeFrom;
    this.vTimeFrom = Math.min(Math.max(this.vTimeFrom, 0), 48);
    this.calcRealTimeRange();
  };

  this.decTimeFrom = function (delta) {
    this.vTimeFrom -= delta;
    this.vTimeFrom = Math.max(this.vTimeFrom, 0);
    this.calcRealTimeRange();
  };

  this.incTimeFrom = function (delta) {
    this.vTimeFrom += delta;
    this.vTimeFrom = Math.min((this.vTimeTo - 2), this.vTimeFrom, 48);
    this.calcRealTimeRange();
  };

  this.setTimeTo = function (timeTo) {
    this.vTimeTo = timeTo;
    this.vTimeTo = Math.min(Math.max(this.vTimeTo, 0), 48);
    this.calcRealTimeRange();
  };

  this.decTimeTo = function (delta) {
    this.vTimeTo -= delta;
    this.vTimeTo = Math.max((this.vTimeFrom + 2), this.vTimeTo, 0);
    this.calcRealTimeRange();
  };

  this.incTimeTo = function (delta) {
    this.vTimeTo += delta;
    this.vTimeTo = Math.min(this.vTimeTo, 48);
    this.calcRealTimeRange();
  };

  this.setDuration = function (dur) {
    this.setTimeTo(this.vTimeFrom + dur);
  };

  this.decDuration = function (delta) {
    this.decTimeTo(delta);
  };

  this.incDuration = function (delta) {
    this.incTimeTo(delta);
  };

  /* Validation */
  this.isValid = function () {
    return this.getShipId() && this.getSelDate() && this.vTimeFrom && this.vTimeTo && !BookListService.hasBookClash(this.getSelDate(), this.getShipId());
  };

  return this;

}]);

