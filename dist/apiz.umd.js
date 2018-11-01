(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.apizng = {})));
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
	    globalClient,
	    globalImmutableMeta = false; // ES2018+, 是讲这个特性没法被babel转译,
	// 那既然都用ES2018了, 不如把能用的特性都用上好了...

	const defaultParamRegex = /(?<=\/):((\w|-)+)/g,
	      methodMap = {
	  GET: noBodyRequest,
	  HEAD: noBodyRequest,
	  POST: bodyRequest,
	  PUT: bodyRequest,
	  PATCH: bodyRequest,
	  // 尽管浏览器支持OPTIONS和DELETE带body, 但是考虑到不常用,
	  // 还是默认它们不带body, 如果需要的话, 可以直接开启完整选项加入body
	  // 有空改成可配置吧
	  OPTIONS: noBodyRequest,
	  DELETE: noBodyRequest
	};

	function parseApiInfo(name, rawInfo, {
	  baseURL: gBaseURL,
	  paramRegex,
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
	    info.url = (bURL + (path || '')).replace(/(?<!:)(\/\/)/g, '/');
	  } else {
	    throw new Error(`API "${name}" must set url or baseURL correctly.`);
	  }

	  method = method.toUpperCase();
	  let methodLowerCase = method.toLowerCase();

	  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
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

	  if (params) {
	    url = url.replace(regex, replaceParams(params));
	  } else if (pathParams) {
	    throw new Error('Path params is required.');
	  }

	  if (query) {
	    qs = querystring(query);
	    url = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
	  }

	  return this[methodLowerCase](url);
	}

	function bodyRequest(...args) {
	  const {
	    methodLowerCase,
	    type: defaultType,
	    pathParams,
	    regex,
	    querystring
	  } = this;
	  let params,
	      query,
	      body,
	      type,
	      qs,
	      url = this.url;

	  if (args[1] === true) {
	    return this[methodLowerCase](url, args[0], type, true);
	  } else if (pathParams) {
	    params = args[1];
	    query = args[2];
	    type = args[3] || defaultType;
	  } else {
	    query = args[1];
	    type = args[2] || defaultType;
	  }

	  body = args[0];

	  if (params) {
	    url = url.replace(regex, replaceParams(params));
	  } else if (pathParams) {
	    throw new Error('Path params is required.');
	  } // 这里实际上会造成带body的query的集合和不带body的query的集合不一致,
	  // 不过考虑实际情况这样的不一致也是可以接受


	  if (isStr(query) && !query.includes('=')) {
	    type = query;
	  } else if (query) {
	    qs = querystring(query);
	    url = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
	  }

	  return this[methodLowerCase](url, body, type, false);
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
	      querystring,
	      client,
	      meta = {};
	  isStr(apiMeta._baseURL) && (baseURL = apiMeta._baseURL);
	  ({
	    baseURL = baseURL,
	    immutableMeta = globalImmutableMeta,
	    paramRegex = globalParamRegex || defaultParamRegex,
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
	        console.warn(`The ${key} in meta is not an object.`);
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

	      const apiFn = createAPI(meta[key]);
	      Reflect.set(receiver, key, apiFn);
	      return apiFn;
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
	  immutableMeta,
	  client,
	  reset,
	  defaultType: dt
	} = {
	  reset: true
	}) {
	  isFn(querystring) && (globalQuerystring = querystring);
	  paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
	  globalImmutableMeta = immutableMeta;
	  globalClient = client;
	  defaultType = dt;
	  reset && (globalQuerystring = globalParamRegex = globalClient = defaultType = undefined, globalImmutableMeta = false);
	}

	function querystring(obj) {
	  if (Object.prototype.toString.call(obj) === '[object Object]') {
	    return Object.keys(obj).map(k => Array.isArray(obj[k]) ? obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
	  } else if (typeof obj === 'string') {
	    return obj;
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
