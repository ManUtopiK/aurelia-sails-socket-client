'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

exports.__esModule = true;

var _import = require('core-js');

var core = _interopRequireWildcard(_import);

var _LogManager = require('aurelia-framework');

var CSRFInterceptor = (function () {
  function CSRFInterceptor(url, client, token) {
    _classCallCheck(this, CSRFInterceptor);

    this.url = url;
    this.client = client;
    this.token = token;
  }

  CSRFInterceptor.prototype.request = function request(message) {
    var _this = this;

    if (message.method === 'get' || message.url === this.url) {
      return message;
    }

    if (this.token) {
      this.setCsrfTokenHeader(message);
      return message;
    } else {
      return new Promise(function (resolve, reject) {
        _this.client.get(_this.url).then(function (response) {
          _this.token = response.content._csrf;
          _this.setCsrfTokenHeader(message);
          resolve(message);
        })['catch'](reject);
      });
    }
  };

  CSRFInterceptor.prototype.setCsrfTokenHeader = function setCsrfTokenHeader(message) {
    message.headers.add('X-Csrf-Token', this.token);
    return message;
  };

  return CSRFInterceptor;
})();

exports.CSRFInterceptor = CSRFInterceptor;

var logger = _LogManager.LogManager.getLogger('sails');

var LoggerInterceptor = (function () {
  function LoggerInterceptor() {
    _classCallCheck(this, LoggerInterceptor);
  }

  LoggerInterceptor.prototype.request = function request(message) {
    logger.debug('Sending message to sails', message);
    return message;
  };

  LoggerInterceptor.prototype.response = (function (_response) {
    function response(_x) {
      return _response.apply(this, arguments);
    }

    response.toString = function () {
      return _response.toString();
    };

    return response;
  })(function (response) {
    logger.debug('Receiving response from sails', response);
    return response;
  });

  LoggerInterceptor.prototype.responseError = function responseError(response) {
    logger.error('There was an error during sails request', response);
    throw response;
  };

  return LoggerInterceptor;
})();

exports.LoggerInterceptor = LoggerInterceptor;