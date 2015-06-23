define(['exports', 'core-js', './socket-response-message'], function (exports, _coreJs, _socketResponseMessage) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  exports.__esModule = true;

  var _core = _interopRequire(_coreJs);

  var RequestMessageProcessor = (function () {
    function RequestMessageProcessor(transformers) {
      _classCallCheck(this, RequestMessageProcessor);

      this.transformers = transformers;
    }

    RequestMessageProcessor.prototype.abort = function abort() {
      throw new Error('Cannot abort socket request');
    };

    RequestMessageProcessor.prototype.process = function process(client, message) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var transformers = _this.transformers,
            promises = [],
            i,
            ii;

        for (i = 0, ii = transformers.length; i < ii; ++i) {
          promises.push(transformers[i](client, _this, message));
        }

        return Promise.all(promises).then(function () {
          return resolve(message);
        })['catch'](reject);
      }).then(function (message) {

        var processRequest = function processRequest(message) {
          return new Promise(function (resolve, reject) {
            client.socket.request(message.options, function (data, jwr) {
              var response = new _socketResponseMessage.SocketResponseMessage(message, data, jwr);
              if (response.isSuccess) {
                resolve(response);
              } else {
                reject(response);
              }
            });
          });
        };

        var chain = [[processRequest, undefined]];

        var interceptors = message.interceptors || [];
        interceptors.forEach(function (interceptor) {
          if (interceptor.request || interceptor.requestError) {
            chain.unshift([interceptor.request ? interceptor.request.bind(interceptor) : undefined, interceptor.requestError ? interceptor.requestError.bind(interceptor) : undefined]);
          }

          if (interceptor.response || interceptor.responseError) {
            chain.push([interceptor.response ? interceptor.response.bind(interceptor) : undefined, interceptor.responseError ? interceptor.responseError.bind(interceptor) : undefined]);
          }
        });

        var interceptorsPromise = Promise.resolve(message);

        while (chain.length) {
          interceptorsPromise = interceptorsPromise.then.apply(interceptorsPromise, chain.shift());
        }

        return interceptorsPromise;
      });
    };

    return RequestMessageProcessor;
  })();

  exports.RequestMessageProcessor = RequestMessageProcessor;
});