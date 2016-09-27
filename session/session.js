/*globals angular*/
"use strict";

var session = angular.module("session", []);


session.constant("AUTH_EVENTS", {
  loginSuccess: "auth-login-success",
  loginFailed: "auth-login-failed",
  logoutSuccess: "auth-logout-success",
  sessionTimeout: "auth-session-timeout",
  notAuthenticated: "auth-not-authenticated",
  notAuthorized: "auth-not-authorized"
});


session.constant("USER_ROLES", {
  user: "user"
});


session.service("SessionService", function () {
  this.create = function (sessionId, user) {
    this.sessionId = sessionId;
    this.user = user;
  };
  this.destroy = function () {
    this.sessionId = null;
    this.user = null;
  };
  return this;
});


session.factory("AuthService", ["$http", "$location", "SessionService", "ShipService", function ($http, $location, SessionService, ShipService) {

  var authService = {};

  authService.login = function (userInfo) {
    return $http
      .get("/sailcom-proxy/session/login?user=" + userInfo.userId + "&pwd=" + userInfo.pwd)
      //.get("/sailcom-proxy/login?user=82219&pwd=segeln")
      //.get("/sailcom-proxy/session/login?user=test&pwd=test")
      .then(function (rsp) {
        SessionService.create(rsp.data.sessionId, rsp.data.user);
      }, function (rsp) {
        SessionService.destroy();
        ShipService.destroy();
      });
  };

  authService.logout = function () {
    return $http
      .get("/sailcom-proxy/session/logout")
      .then(function (rsp) {
        SessionService.destroy();
        ShipService.destroy();
      }, function (rsp) {
        SessionService.destroy();
        ShipService.destroy();
      });
  };

  authService.isAuthenticated = function () {
    return !!SessionService.user && !!SessionService.user.id;
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(SessionService.userRole) !== -1);
  };

  return authService;

}]);


session.config(function ($httpProvider) {
  $httpProvider.interceptors.push([
    "$injector",
    function ($injector) {
      return $injector.get("AuthInterceptor");
    }
  ]);
});


session.factory("AuthInterceptor", ["$rootScope", "$q", "AUTH_EVENTS", function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
}]);
