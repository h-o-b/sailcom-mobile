/*globals angular, ships */
"use strict";

ships.service("ShipService", ["$http", "$q", function ($http, $q) {

  this.allLakeList = null;
  this.myLakeList = null;
  this.allHarborList = null;
  this.myHarborList = null;
  this.allShipList = null;
  this.myShipList = null;

  this.init = function () {
    this.allLakeList = [];
    this.myLakeList = [];
    this.lakeMap = {};
    this.allHarborList = [];
    this.myHarborList = [];
    this.harborMap = {};
    this.allShipList = [];
    this.myShipList = [];
    this.shipMap = {};
  };

  this.create = function () {
    this.init();
    return this.getData();
  };

  this.getAllLakes = function () {
    return this.allLakeList;
  };

  this.getMyLakes = function () {
    return this.myLakeList;
  };

  this.getLake = function (lakeId) {
    return this.lakeMap[lakeId];
  };

  this.getAllHarbors = function () {
    return this.allHarborList;
  };

  this.getMyHarbors = function () {
    return this.myHarborList;
  };

  this.getHarbor = function (harborId) {
    return this.harborMap[harborId];
  };

  this.getHarborsForLake = function (lakeId) {
    var lake = this.getLake(lakeId);
    if (lake) {
      return lake.harbors;
    }
    return [];
  };

  this.getAllShips = function () {
    return this.allShipList;
  };

  this.getMyShips = function () {
    return this.myShipList;
  };

  this.getShip = function (shipId) {
    return this.shipMap[shipId];
  };

  this.getShipsForLake = function (lakeId) {
    var lake = this.getLake(lakeId);
    if (lake) {
      return lake.ships;
    }
    return [];
  };

  this.getShipsForHarbor = function (harborId) {
    var harbor = this.getHarbor(harborId);
    if (harbor) {
      return harbor.ships;
    }
    return [];
  };

  this.getData = function () {
    var that = this;
    return $q.all([
      $http
        .get("/sailcom-proxy/lakes")
        .then(function (rsp) {
          that.allLakeList = rsp.data;
        }),
      $http
        .get("/sailcom-proxy/harbors")
        .then(function (rsp) {
          that.allHarborList = rsp.data;
        }),
      $http
        .get("/sailcom-proxy/ships")
        .then(function (rsp) {
          that.allShipList = rsp.data;
        })
    ])
      .then(function () {

        var lakeCnt = that.allLakeList.length;
        var harborCnt = that.allHarborList.length;
        var shipCnt = that.allShipList.length;
        var i, lake, harbor, ship;

        for (i = 0; i < lakeCnt; i++) {
          lake = that.allLakeList[i];
          lake.harbors = [];
          lake.ships = [];
          that.lakeMap[lake.id] = lake;
          if (lake.isMine) {
            that.myLakeList.push(lake);
          }
        }

        for (i = 0; i < harborCnt; i++) {
          harbor = that.allHarborList[i];
          lake = that.getLake(harbor.lakeId);
          harbor.ships = [];
          harbor.lakeName = lake.name;
          that.harborMap[harbor.id] = harbor;
          lake.harbors.push(harbor);
          if (harbor.isMine) {
            that.myHarborList.push(harbor);
          }
        }

        for (i = 0; i < shipCnt; i++) {
          ship = that.allShipList[i];
          lake = that.getLake(ship.lakeId);
          harbor = that.getHarbor(ship.harborId);
          ship.lakeName = that.getLake(ship.lakeId).name;
          ship.harborName = that.getHarbor(ship.harborId).name;
          that.shipMap[ship.id] = ship;
          harbor.ships.push(ship);
          lake.ships.push(ship);
          if (ship.isMine) {
            that.myShipList.push(ship);
          }
        }

      });
  };

  this.destroy = function () {
    this.init();
  };

  return this;

}]);


ships.service("ShipListService", ["ShipService", function (ShipService) {

  this.itemList = {};

  this.getItemList = function (lakeId) {
    if (!this.itemList[lakeId]) {
      //item = { kind: "lake", lake: Lake };
      //item = { kind: "lake", ship: Ship };
      var item = null;
      var itemList = [];
      var harborList = ShipService.getHarborsForLake(lakeId), h;
      var shipList, s;
      for (h = 0; h < harborList.length; h++) {
        item = { kind: "harbor", harbor: harborList[h] };
        itemList.push(item);
        shipList = ShipService.getShipsForHarbor(harborList[h].id);
        for (s = 0; s < shipList.length; s++) {
          item = { kind: "ship", ship: shipList[s] };
          itemList.push(item);
        }
      }
      this.itemList[lakeId] = itemList;
    }
    return this.itemList[lakeId];
  };

  return this;

}]);


ships.constant("SHIP_SEL", {
  mine: "ship-sel-mine",
  lake: "ship-sel-lake",
  harbor: "ship-sel-harbor",
  ship: "ship-sel-ship"
});


ships.service("ShipSelService", ["ShipService", "SHIP_SEL", function (ShipService, SHIP_SEL) {

  /* Ship Selection */
  this.shipSel = null;  // SHIP_SEL (mine, lake, harbor, ship)
  this.selId = null;

  this.setShipSel = function (shipSel, selId) {
    this.shipSel = shipSel;
    if (shipSel === SHIP_SEL.mine) {
      this.selId = null;
    } else if (shipSel === SHIP_SEL.lake) {
      this.selId = selId;
    } else if (shipSel === SHIP_SEL.harbor) {
      this.selId = selId;
    } else if (shipSel === SHIP_SEL.ship) {
      this.selId = selId;
    } else {
      this.shipSel = null;
      this.selId = null;
    }
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
      if (shipSel === SHIP_SEL.mine) {
        return true;
      }
      if (shipSel === SHIP_SEL.ship) {
        return ShipService.getShip(selId).isMine;
      }
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

  this.hasSel = function (shipSel, selId) {
    var shipList, i, ship;
    if (shipSel === SHIP_SEL.mine) {
      shipList = ShipService.getMyShips();
    }
    if (shipSel === SHIP_SEL.lake) {
      shipList = ShipService.getShipsForLake(selId);
    }
    if (shipSel === SHIP_SEL.harbor) {
      shipList = ShipService.getShipsForHarbor(selId);
    }
    if (shipSel === SHIP_SEL.ship) {
      return false;
    }
    for (i = 0; i < shipList.length; i++) {
      ship = shipList[i];
      if (this.isSel(SHIP_SEL.ship, ship.id)) {
        return true;
      }
    }
    return false;
  };

  return this;

}]);

