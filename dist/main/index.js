'use strict';

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

var mapObj = require('map-obj');

var camelCase = require('camelcase');

var QuickLru = require('quick-lru');

var has = function has(array, key) {
  return array.some(function (x) {
    if (typeof x === 'string') {
      return x === key;
    }

    x.lastIndex = 0;
    return x.test(key);
  });
};

var cache = new QuickLru({
  maxSize: 100000
}); // Reproduces behavior from `map-obj`

var isObject = function isObject(value) {
  return _typeof(value) === 'object' && value !== null && !(value instanceof RegExp) && !(value instanceof Error) && !(value instanceof Date);
};

var camelCaseConvert = function camelCaseConvert(input, options) {
  if (!isObject(input)) {
    return input;
  }

  options = _objectSpread2({
    deep: false,
    pascalCase: false
  }, options);
  var _options = options,
      exclude = _options.exclude,
      pascalCase = _options.pascalCase,
      stopPaths = _options.stopPaths,
      deep = _options.deep;
  var stopPathsSet = new Set(stopPaths);

  var makeMapper = function makeMapper(parentPath) {
    return function (key, value) {
      if (deep && isObject(value)) {
        var path = parentPath === undefined ? key : "".concat(parentPath, ".").concat(key);

        if (!stopPathsSet.has(path)) {
          value = mapObj(value, makeMapper(path));
        }
      }

      if (!(exclude && has(exclude, key))) {
        var cacheKey = pascalCase ? "".concat(key, "_") : key;

        if (cache.has(cacheKey)) {
          key = cache.get(cacheKey);
        } else {
          var ret = camelCase(key, {
            pascalCase: pascalCase
          });

          if (key.length < 100) {
            // Prevent abuse
            cache.set(cacheKey, ret);
          }

          key = ret;
        }
      }

      return [key, value];
    };
  };

  return mapObj(input, makeMapper(undefined));
};

module.exports = function (input, options) {
  if (Array.isArray(input)) {
    return Object.keys(input).map(function (key) {
      return camelCaseConvert(input[key], options);
    });
  }

  return camelCaseConvert(input, options);
};
//# sourceMappingURL=index.js.map
