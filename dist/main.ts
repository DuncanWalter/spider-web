/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/utils.ts
function mapObjectProps(model, mapper) {
  var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var _arr = Object.keys(target);

  for (var _i = 0; _i < _arr.length; _i++) {
    var key = _arr[_i];
    target[key] = mapper(model[key], key);
  }

  return target;
}
// CONCATENATED MODULE: ./src/vertex.ts
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// TODO: disallow any nested calls to handleRequest on Vertices
// TODO: use a pushable interface
// TODO: make only the mono version

// type CacheMap<VM extends VertexMap> = { [K in keyof VM]: VertexValue<VM[K]> }
var invalidCache = Symbol('INVALID_CACHE');
var Vertex =
/*#__PURE__*/
function () {
  _createClass(Vertex, [{
    key: "revoke",
    //
    //
    //
    value: function revoke() {
      var value = this.cache;
      this.cache = invalidCache;

      if (this.childCount > 0 || !this.lazy) {
        var newValue = this.pull();

        if (newValue !== value || this.deep) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var child = _step.value;

              if (child !== null) {
                child.push(newValue);
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
    }
  }, {
    key: "push",
    value: function push(value) {
      var newValue = this.mapping(value, this.cache);

      if (newValue !== null) {
        var lastValue = this.cache;
        this.cache = newValue;

        if (this.deep || lastValue !== newValue) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var child = _step2.value;

              if (child) {
                child.push(newValue);
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
    }
  }, {
    key: "pull",
    value: function pull() {
      var _this = this;

      var cacheIsValid = this.cache !== invalidCache && (this.childCount > 0 || Object.keys(this.dependencies).reduce(function (cacheIsValid, key) {
        var dep = _this.dependencies[key];
        var newValue = dep.handleRequest(requestId);

        if (dep.deep || dep.cache !== newValue) {
          _this.dependencies[key] = newValue;
          return false;
        } else {
          return cacheIsValid;
        }
      }, true));

      if (cacheIsValid) {
        return this.cache;
      } else {
        this.cache = this.mapping(this.dependencies);
        return this.cache;
      }
    }
  }, {
    key: "subscribe",
    value: function subscribe(newChild) {
      if (this.childCount === 0) {
        // TODO: propagate subscription
        this.propagateSubscription();
      }

      this.childCount++;

      for (var i = 0; i++; i < this.children.length) {
        if (!this.children[i]) {
          this.children[i] = newChild;
          return i;
        }
      }

      this.children.push(newChild);
      return this.children.length - 1;
    }
  }, {
    key: "unsubscribe",
    value: function unsubscribe(subscription) {
      if (!this.children[subscription]) {
        throw new Error('Same child unsubscribed twice');
      }

      this.childCount--;
      this.children[subscription] = null;

      if (this.childCount === 0) {
        this.propagateUnsubscription();
      }
    }
  }]);

  function Vertex(dependencies, mapping) {
    _classCallCheck(this, Vertex);

    this.children = [];
    this.children = [];
    this.childCount = 0;
    this.mapping = mapping;
    this.dependencies = dependencies;
    this.dependencyValues = {};
    this.cache = invalidCache;
  }

  return Vertex;
}();
var NullVertex =
/*#__PURE__*/
function (_Vertex) {
  _inherits(NullVertex, _Vertex);

  function NullVertex(mapping) {
    _classCallCheck(this, NullVertex);

    return _possibleConstructorReturn(this, _getPrototypeOf(NullVertex).call(this, {}, mapping));
  }

  _createClass(NullVertex, [{
    key: "propagateSubscription",
    value: function propagateSubscription() {}
  }, {
    key: "propagateUnsubscription",
    value: function propagateUnsubscription() {}
  }]);

  return NullVertex;
}(Vertex);
var MonoVertex =
/*#__PURE__*/
function (_Vertex2) {
  _inherits(MonoVertex, _Vertex2);

  function MonoVertex(dependencies, mapping) {
    var _this2;

    _classCallCheck(this, MonoVertex);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(MonoVertex).call(this, dependencies, mapping));
    _this2.lazy = dependencies.lazy;
    _this2.deep = dependencies.deep;
    _this2.volatile = dependencies.volatile;
    return _this2;
  }

  _createClass(MonoVertex, [{
    key: "propagateSubscription",
    value: function propagateSubscription() {
      this.subscriptions = this.dependencies.subscribe(this);
    }
  }, {
    key: "propagateUnsubscription",
    value: function propagateUnsubscription() {
      if (this.subscriptions) {
        this.dependencies.unsubscribe(this.subscriptions);
        this.subscriptions = undefined;
      }
    }
  }]);

  return MonoVertex;
}(Vertex);
var vertex_PolyVertex =
/*#__PURE__*/
function (_Vertex3) {
  _inherits(PolyVertex, _Vertex3);

  function PolyVertex() {
    _classCallCheck(this, PolyVertex);

    return _possibleConstructorReturn(this, _getPrototypeOf(PolyVertex).apply(this, arguments));
  }

  _createClass(PolyVertex, [{
    key: "propagateSubscription",
    value: function propagateSubscription() {
      var _this3 = this;

      this.subscriptions = mapObjectProps(this.dependencies, function (dep, key) {
        return dep.subscribe({
          push: function push(value) {
            _this3.dependencyValues[key] = value;

            _this3.push(_this3.dependencyValues);
          }
        });
      }, {});
    }
  }, {
    key: "propagateUnsubscription",
    value: function propagateUnsubscription() {
      var _this4 = this;

      if (this.subscriptions) {
        mapObjectProps(this.subscriptions, function (sub, key) {
          _this4.dependencies[key].unsubscribe(sub);
        });
        this.subscriptions = undefined;
      }
    }
  }]);

  return PolyVertex;
}(Vertex);
// CONCATENATED MODULE: ./src/index.ts
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Resource", function() { return src_Resource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "defineResource", function() { return defineResource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "requestResource", function() { return requestResource; });
function src_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function src_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function src_createClass(Constructor, protoProps, staticProps) { if (protoProps) src_defineProperties(Constructor.prototype, protoProps); if (staticProps) src_defineProperties(Constructor, staticProps); return Constructor; }



var src_Resource =
/*#__PURE__*/
function () {
  src_createClass(Resource, [{
    key: "revoke",
    value: function revoke() {
      this.vertex.revoke();
    }
  }, {
    key: "toVertex",
    value: function toVertex() {
      return this.vertex;
    }
  }], [{
    key: "define",
    value: function define(dependencies, create) {
      if (dependencies !== null) {
        return new Resource(new NullVertex(create));
      } else if (dependencies instanceof Resource) {
        return new Resource(new MonoVertex(dependencies.toVertex(), create));
      } else {
        return new Resource(new vertex_PolyVertex(mapObjectProps(dependencies, function (res) {
          return res.toVertex();
        }), create));
      }
    }
  }, {
    key: "request",
    value: function request(resources) {
      if (resources instanceof Resource) {
        return resources.toVertex().pull();
      } else {
        return mapObjectProps(resources, function (prop) {
          return prop.toVertex().pull();
        });
      }
    }
  }]);

  function Resource(vertex) {
    src_classCallCheck(this, Resource);

    this.vertex = vertex;
  }

  return Resource;
}();
var defineResource = src_Resource.define;
var requestResource = src_Resource.request; // export const projectResource = Resource.project

/***/ })
/******/ ]);