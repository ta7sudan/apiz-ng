const toString = Map.call.bind(Object.prototype.toString);

const isObj = o => toString(o) === '[object Object]';

const isFn = f => typeof f === 'function';

const isStr = s => s && typeof s === 'string';

const isEnumerable = Map.call.bind(Object.prototype.propertyIsEnumerable);
let defaultType,
    globalQuerystring,
    globalParamRegex,
    // 这东西有没有, 是什么类型, 应该只能在运行时才能确定了, 或者分析控制流?
// 那就随便写个类型吧...等到使用处as一下好了
globalClient,
    globalImmutableMeta = false; // ES2018+, 是讲这个特性没法被babel转译,
// 那既然都用ES2018了, 不如把能用的特性都用上好了...

const defaultParamRegex = /:((\w|-)+)/g,
      slashRegex = /\/\//g,
      methodMap = {
  get: noBodyRequest,
  head: noBodyRequest,
  post: bodyRequest,
  put: bodyRequest,
  patch: bodyRequest,
  // 尽管浏览器支持OPTIONS和DELETE带body, 但是考虑到不常用,
  // 还是默认它们不带body, 如果需要的话, 可以直接开启完整选项加入body
  // 有空改成可配置吧
  options: noBodyRequest,
  delete: noBodyRequest
},
      replaceSlash = (m, o) => o <= 6 ? m : '/';

function parseApiInfo(name, rawInfo, {
  baseURL: gBaseURL,
  paramRegex,
  querystring,
  client
}) {
  // tslint:disable-next-line
  let {
    url,
    baseURL,
    path,
    meta,
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
    info.url = (bURL + (path || '')).replace(slashRegex, replaceSlash);
  } else {
    throw new Error(`API "${name}" must set url or baseURL correctly.`);
  }

  method = method.toUpperCase();
  const methodLowerCase = method.toLowerCase();

  if (!(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].indexOf(method) !== -1)) {
    throw new Error(`Unsupported HTTP method: ${method}.`);
  }

  if (!isFn(client[methodLowerCase])) {
    throw new Error(`client must implement a ${methodLowerCase} function.`);
  }

  const parts = info.url.split(/\/(?=\w|:)/g),
        offset = /^(https?:|\/)/.test(parts[0]) ? 2 : 1;
  info.baseURL = parts.slice(0, offset).join('/');
  info.path = `/${parts.slice(offset).join('/')}`;
  info.name = name;
  info.meta = meta;
  info.method = method;
  info.methodLowerCase = methodLowerCase; // 前面已经确保了client实现了该method

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
    querystring,
    baseURL,
    path
  } = this;
  let params,
      query,
      qs,
      url = this.url;

  if (args[1] === true) {
    // 接口处记得检测对象是否为空
    return this[methodLowerCase]({
      url,
      name: this.name,
      meta: this.meta,
      options: args[0]
    });
  } else if (pathParams) {
    params = args[0];
    query = args[1];
  } else {
    query = args[0];
  }

  if (params) {
    url = baseURL + path.replace(regex, replaceParams(params));
  } else if (pathParams) {
    throw new Error('Path params is required.');
  }

  if (query) {
    qs = querystring(query);
    url = url.indexOf('?') !== -1 ? `${url}&${qs}` : `${url}?${qs}`;
  }

  return this[methodLowerCase]({
    url,
    name: this.name,
    meta: this.meta
  });
}

function bodyRequest(...args) {
  // $以区分全局变量
  const {
    methodLowerCase,
    type: $defaultType,
    pathParams,
    regex,
    querystring,
    baseURL,
    path
  } = this;
  let params,
      query,
      body,
      type,
      qs,
      url = this.url;

  if (args[1] === true) {
    return this[methodLowerCase]({
      url,
      type,
      name: this.name,
      meta: this.meta,
      options: args[0]
    });
  } else if (pathParams) {
    params = args[1];
    query = args[2];
    type = args[3] || $defaultType;
  } else {
    query = args[1];
    type = args[2] || $defaultType;
  }

  body = args[0];

  if (params) {
    url = baseURL + path.replace(regex, replaceParams(params));
  } else if (pathParams) {
    throw new Error('Path params is required.');
  } // 这里实际上会造成带body的query的集合和不带body的query的集合不一致,
  // 不过考虑实际情况这样的不一致也是可以接受


  if (isStr(query) && !(query.indexOf('=') !== -1)) {
    type = query;
  } else if (query) {
    qs = querystring(query);
    url = url.indexOf('?') !== -1 ? `${url}&${qs}` : `${url}?${qs}`;
  }

  return this[methodLowerCase]({
    url,
    type,
    body,
    name: this.name,
    meta: this.meta
  });
}

function createAPI(info) {
  // const fn = methodMap[info.method]
  const f = methodMap[info.methodLowerCase]; // 因为在parseApiInfo的时候已经判断过了, 所以这里不需要判断了, 可以确定f不为空
  // 但是如果哪天重构把前面的判断去掉了, 这里记得加回来
  // if (!f) {
  // 	throw new Error(`APIzClient must implement ${info.methodLowerCase} method.`);
  // }

  const fn = f.bind(info);
  ['url', 'method', 'meta', 'type', 'pathParams'].forEach(k => {
    Object.defineProperty(fn, k, {
      value: info[k],
      enumerable: true,
      writable: false
    });
  });
  return fn;
} // 理想情况下是这样的
// class APIz<T, M, N extends APIMeta<T, M>> {
// 	public add: (name: string, apiInfo: APIMetaInfo<T, M>) => this;
// 	public remove: (name: string) => this;
// 	[K in key of N]: object;
// 	constructor(apiMeta: N, options: APIzOptions<>) {
// 	}
// }
// type ProxyMeta<T, M, N extends APIMeta<T, M>> = {
// 	[K in keyof N]: object;
// };
// TODO 这里有重载, params还是query由配置选项中的pathParams作为隐式参数决定了
// type APIzRequestWithBody<T extends string> = ((body: any, params: KVObject, query: KVObject | string, type: T) => Promise<any>)
// 	| ((body: any, params: KVObject, query: KVObject | string) => Promise<any>)
// 	| ((body: any, params: KVObject, type: T) => Promise<any>)
// 	| ((body: any, params: KVObject) => Promise<any>)
// 	| ((body: any, query: KVObject | string, type: T) => Promise<any>)
// 	| ((body: any, query: KVObject | string) => Promise<any>)
// 	| ((body: any, type: T) => Promise<any>)
// 	| ((body: any) => Promise<any>);
// // TODO 这里有重载, params还是query由配置选项中的pathParams作为隐式参数决定了
// type APIzRequestWithoutBody = ((params: KVObject, query: KVObject | string) => Promise<any>)
// 	| ((params: KVObject) => Promise<any>)
// 	| ((query: KVObject | string) => Promise<any>)
// 	| (() => Promise<any>);
// type APIzConstructor<C, T extends string, M, N extends APIMeta<T, M>> =	new (apiMeta: N, options: APIzOptions<C>) => APIzInstance<T, M, N>;
// class不知道怎么实现mapped types, 用function又没办法直接
// 实现上面的constructor接口, 只能是让ts中不允许new调用, js中运行new调用了
// 其实也没什么影响, 除了看上去不那么面向对象少个new
// 另外泛型参数过多有什么好的解决办法?


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
    // 这里undefined没什么影响, 视为boolean没问题
    immutableMeta = globalImmutableMeta,
    paramRegex = globalParamRegex || defaultParamRegex,
    // 这里querystring虽然可能为undefined, 但是后面立马检测了是否为callable,
    // 为了给js用户提示, 所以这里也可以暂时视为不为undefined
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
      } // 到这里有个meta[key]在运行时从APIMetaInfo到ParsedAPIMetaInfo的类型转换
      // 只能是强行as了


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
    return this;
  };

  self.add = function (name, apiInfo) {
    if (meta[name]) {
      throw new Error(`API "${name}" already exists.`);
    }

    meta[name] = parseApiInfo(name, apiInfo, groupOptions); // 同前面一样存在运行时类型转换

    this[name] = createAPI(meta[name]);
    return this;
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

const querystring = function (obj) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    return Object.keys(obj).map(k => Array.isArray(obj[k]) ? obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
  } else if (typeof obj === 'string') {
    return obj;
  } else {
    return JSON.stringify(obj);
  }
};

config({
  querystring,
  defaultType: 'json'
});

export { APIz, config };
//# sourceMappingURL=apiz.esm.js.map
