/**
 * @Version 0.1.0
 * @Author: ta7sudan
 * @Repo: https://github.com/ta7sudan/apiz-ng#readme
 * @License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['apiz-ng'] = {})));
}(this, (function (exports) { 'use strict';

	/* global false */
	const toString = Map.call.bind(Object.prototype.toString);

	const isObj = o => toString(o) === '[object Object]';

	const isFn = f => typeof f === 'function';

	const isStr = s => s && typeof s === 'string';

	const isEnumerable = Map.call.bind(Object.prototype.propertyIsEnumerable);
	let defaultType,
	    globalQuerystring,
	    globalParamRegex,
	    globalBodyPareser,
	    globalClient,
	    globalImmutableMeta = false;
	const defaultParamRegex = /:((\w|-)+)/g,
	      methodMap = {
	  GET: noBodyRequest,
	  HEAD: noBodyRequest,
	  POST: bodyRequest,
	  PUT: bodyRequest,
	  PATCH: bodyRequest,
	  OPTIONS: bodyRequest,
	  DELETE: bodyRequest
	};

	function defaultBodyParser(data, type = 'json', querystring) {
	  if (type === 'json') {
	    return JSON.stringify(data);
	  } else if (type === 'form') {
	    return querystring(data);
	  } else {
	    return data;
	  }
	}

	function parseApiInfo(name, rawInfo, {
	  baseURL: gBaseURL,
	  paramRegex,
	  bodyParser,
	  querystring,
	  client
	}) {
	  let {
	    url,
	    baseURL,
	    path,
	    method = 'GET',
	    type = defaultType,
	    pathParams = false
	  } = rawInfo;
	  const info = {},
	        bURL = baseURL || gBaseURL;

	  if (name === 'remove' || name === 'add') {
	    throw new Error('"remove" and "add" is preserved key.');
	  }

	  if (!isObj(rawInfo)) {
	    throw new TypeError(`API ${name} expected an object, but received ${JSON.stringify(rawInfo)}.`);
	  }

	  if (isStr(url)) {
	    info.url = url;
	  } else if (isStr(bURL)) {
	    info.url = (bURL + (path || '')).replace(/:?\/\//g, m => ~m.indexOf(':') ? m : '/');
	  } else {
	    throw new Error(`API "${name}" must set url or baseURL correctly.`);
	  }

	  method = method.toUpperCase();
	  let methodLowerCase = method.toLowerCase();

	  if (!(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].indexOf(method) !== -1)) {
	    throw new Error(`Unsupported HTTP method: ${method}.`);
	  }

	  if (!isFn(client[methodLowerCase])) {
	    throw new Error(`client must implement a ${methodLowerCase} function.`);
	  }

	  info.method = method;
	  info.methodLowerCase = methodLowerCase;
	  info[methodLowerCase] = client[methodLowerCase];
	  info.type = type;
	  info.pathParams = pathParams;
	  info.regex = paramRegex;
	  info.querystring = querystring;
	  info.bodyParser = bodyParser;
	  info.init = true;
	  return info;
	}

	function replaceParams(params) {
	  return (m, v) => {
	    if (params[v] == null) {
	      throw new Error(`Can't find a property "${v}" in params.`);
	    }

	    return encodeURIComponent(params[v]);
	  };
	} // 其实noBodyRequest和bodyRequest我们可以合并成一个,
	// 因为我们已经知道method了, 也就可以知道它是否会带body,
	// 但是考虑到让代码更加清晰一点, 还是拆成两个吧, 这点
	// 代码重复算是可以接受. 另一方面讲, 其实也可以让接口只
	// 实现一个request方法就好, 而不用对每个HTTP方法都实现一个
	// 对应的方法, 因为我们也可以把method传过去


	function noBodyRequest(...args) {
	  const {
	    methodLowerCase,
	    pathParams,
	    regex,
	    querystring
	  } = this;
	  let params,
	      query,
	      qs,
	      url = this.url;

	  if (args[1] === true) {
	    // 接口处记得检测对象是否为空
	    return this[methodLowerCase](url, args[0]);
	  } else if (pathParams) {
	    params = args[0];
	    query = args[1];
	  } else {
	    query = args[0];
	  }

	  if (!query && !params) {
	    return this[methodLowerCase](url);
	  }

	  if (params) {
	    url = url.replace(regex, replaceParams(params));
	  } else if (pathParams) {
	    throw new Error('Path params is required.');
	  }

	  if (query) {
	    qs = querystring(query);
	    url = ~url.indexOf('?') ? `${url}&${qs}` : `${url}?${qs}`;
	  }

	  return this[methodLowerCase](url);
	}

	function bodyRequest(...args) {
	  const {
	    methodLowerCase,
	    type,
	    pathParams,
	    regex,
	    querystring,
	    bodyParser
	  } = this;
	  let rawBody,
	      params,
	      query,
	      body,
	      qs,
	      url = this.url;

	  if (args[1] === true) {
	    return this[methodLowerCase](url, args[0], type);
	  } else if (pathParams) {
	    params = args[1];
	    query = args[2];
	  } else {
	    query = args[1];
	  }

	  rawBody = args[0];
	  body = bodyParser(rawBody, type, querystring);

	  if (params) {
	    url = url.replace(regex, replaceParams(params));
	  } else if (pathParams) {
	    throw new Error('Path params is required.');
	  }

	  if (!query && !params) {
	    return this[methodLowerCase](url, body, type);
	  }

	  if (query) {
	    qs = querystring(query);
	    url = ~url.indexOf('?') ? `${url}&${qs}` : `${url}?${qs}`;
	  }

	  return this[methodLowerCase](url, body, type);
	}

	function createAPI(info) {
	  const fn = methodMap[info.method].bind(info);
	  ['url', 'method', 'type', 'pathParams'].forEach(k => {
	    Object.defineProperty(fn, k, {
	      value: info[k],
	      enumerable: true,
	      writable: false
	    });
	  });
	  return fn;
	} // 别问, 就是不喜欢ES6 class


	function APIz(apiMeta, options) {
	  let baseURL,
	      immutableMeta,
	      paramRegex,
	      bodyParser,
	      querystring,
	      client,
	      meta = {};
	  isStr(apiMeta._baseURL) && (baseURL = apiMeta._baseURL);
	  ({
	    baseURL = baseURL,
	    immutableMeta = globalImmutableMeta,
	    paramRegex = globalParamRegex || defaultParamRegex,
	    bodyParser = globalBodyPareser || defaultBodyParser,
	    querystring = globalQuerystring,
	    client = globalClient
	  } = options || {});

	  if (!isFn(querystring)) {
	    throw new Error('A querystring function must set.');
	  }

	  if (!client) {
	    throw new Error('A client must set.');
	  }

	  const groupOptions = {
	    baseURL,
	    paramRegex,
	    bodyParser,
	    querystring,
	    client
	  };

	  if (immutableMeta) {
	    meta = apiMeta || {};
	  } else {
	    // 不用Object.keys, 允许配置对象继承
	    for (const key in apiMeta) {
	      if (isObj(apiMeta[key])) {
	        meta[key] = parseApiInfo(key, apiMeta[key], groupOptions);
	      } else if (key !== '_baseURL') {
	        console.warn(`The ${key} in config is not an object.`);
	      }
	    }
	  }

	  const pxy = new Proxy({}, {
	    get(target, key, receiver) {
	      if (!meta[key] || !isEnumerable(meta, key)) {
	        return Reflect.get(target, key);
	      } else if (!meta[key].init) {
	        meta[key] = parseApiInfo(key, meta[key], groupOptions);
	      }

	      Reflect.set(receiver, key, createAPI(meta[key]));
	      return Reflect.get(receiver, key);
	    },

	    getPrototypeOf() {
	      return APIz.prototype;
	    }

	  });
	  const self = Object.create(pxy);

	  self.remove = function (name) {
	    this[name] && (meta[name] = this[name] = undefined);
	  };

	  self.add = function (name, apiInfo) {
	    if (meta[name]) {
	      throw new Error(`API "${name}" already exists.`);
	    }

	    meta[name] = parseApiInfo(name, apiInfo, groupOptions);
	    this[name] = createAPI(meta[name]);
	  };

	  return self;
	}
	function config({
	  querystring,
	  paramRegex,
	  bodyParser,
	  immutableMeta,
	  client,
	  reset,
	  defaultType: dt
	} = {
	  reset: true
	}) {
	  isFn(querystring) && (globalQuerystring = querystring);
	  isFn(bodyParser) && (globalBodyPareser = bodyParser);
	  paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
	  globalImmutableMeta = immutableMeta;
	  globalClient = client;
	  defaultType = dt;
	  reset && (globalQuerystring = globalParamRegex = globalBodyPareser = globalClient = defaultType = undefined, globalImmutableMeta = false);
	}

	function querystring(obj) {
	  if (Object.prototype.toString.call(obj) === '[object Object]') {
	    return Object.keys(obj).map(k => Array.isArray(obj[k]) ? obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
	  } else {
	    return JSON.stringify(obj);
	  }
	}

	config({
	  querystring,
	  defaultType: 'json'
	});

	exports.APIz = APIz;
	exports.config = config;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=apiz.umd.js.map
