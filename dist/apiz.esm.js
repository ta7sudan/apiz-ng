const toString = Map.call.bind(Object.prototype.toString);

const isStr = s => s && typeof s === 'string';

const isFn = f => typeof f === 'function';

const isObj = o => toString(o) === '[object Object]';

const isEnumerable = Map.call.bind(Object.prototype.propertyIsEnumerable);
let globalQuerystring,
    globalParamRegex,
    globalIsArgsImmutable = false,
    globalClient,
    defaultType;

const defaultParamRegex = /:((\w|-)+)/g,
      slashRegex = /\/\//g,
      replaceSlash = (m, o) => o <= 6 ? m : '/';

function isAPIInfoWithURL(v) {
  return !!v.url;
}

function parseApiInfo(name, rawInfo, {
  baseURL: gBaseURL,
  paramRegex,
  querystring,
  client
}) {
  const {
    method = 'GET',
    type = defaultType,
    meta
  } = rawInfo;
  let url, baseURL, path; // 照理讲放parseApiInfo外面显得更合理一点, 不过考虑到add和实例化的时候都要校验

  if (name === 'remove' || name === 'add') {
    throw new Error('"remove" and "add" is preserved key.');
  }

  if (isAPIInfoWithURL(rawInfo)) {
    url = rawInfo.url;
  } else {
    baseURL = rawInfo.baseURL;
    path = rawInfo.path;
  }

  const info = {},
        bURL = baseURL || gBaseURL;

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

  const methodUpperCase = method.toUpperCase(),
        methodLowerCase = method.toLowerCase();

  if (!(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].indexOf(methodUpperCase) !== -1)) {
    throw new Error(`Unsupported HTTP method: ${methodUpperCase}.`);
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
  info.method = methodUpperCase;
  info.methodLowerCase = methodLowerCase;
  info.client = client;
  info.type = type;
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
}

function request(options, isRawOption) {
  // $以区分全局变量
  const {
    methodLowerCase,
    type: $defaultType,
    regex,
    querystring,
    baseURL,
    path,
    client,
    meta
  } = this;
  let qs,
      // tslint:disable-next-line
  {
    query,
    params,
    body,
    headers,
    type,
    handleError
  } = options || {},
      url = this.url;

  if (isRawOption === true) {
    return client[methodLowerCase]({
      url,
      name: this.name,
      handleError,
      options: options
    });
  }

  type === undefined && (type = $defaultType);

  if (params) {
    url = baseURL + path.replace(regex, replaceParams(params));
  }

  if (query) {
    qs = querystring(query);
    url = url.indexOf('?') !== -1 ? `${url}&${qs}` : `${url}?${qs}`;
  }

  return client[methodLowerCase]({
    url,
    name: this.name,
    handleError,
    meta,
    type,
    body,
    headers,
    query
  });
}

function createAPI(info) {
  const fn = request.bind(info);
  ['url', 'method', 'meta', 'type'].forEach(k => {
    Object.defineProperty(fn, k, {
      value: info[k],
      enumerable: true,
      writable: false
    });
  });
  return fn;
}

function APIz(group, options) {
  let baseURL,
      immutable,
      paramRegex,
      querystring,
      client,
      apiInfoGroup = {};
  isStr(group.baseURL) && (baseURL = group.baseURL);
  ({
    baseURL = baseURL,
    immutable = globalIsArgsImmutable,
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
  const apis = group.apis;

  if (immutable) {
    apiInfoGroup = apis || {};
  } else {
    // 不用Object.keys, 允许配置对象继承
    for (const key in apis) {
      // tslint:disable-next-line
      if (isObj(apis[key])) {
        apiInfoGroup[key] = parseApiInfo(key, apis[key], groupOptions);
      } else {
        console.warn(`The ${key} in meta is not an object.`);
      }
    }
  }

  const pxy = new Proxy({}, {
    get(target, key, receiver) {
      if (!apiInfoGroup[key] || !isEnumerable(apiInfoGroup, key)) {
        return Reflect.get(target, key);
      } else if (!apiInfoGroup[key].init) {
        apiInfoGroup[key] = parseApiInfo(key, apiInfoGroup[key], groupOptions);
      }

      const apiFn = createAPI(apiInfoGroup[key]);
      Reflect.set(receiver, key, apiFn);
      return apiFn;
    },

    getPrototypeOf() {
      return APIz.prototype;
    }

  });
  const self = Object.create(pxy);

  self.remove = function (name) {
    this[name] && (apiInfoGroup[name] = this[name] = undefined);
    return this;
  };

  self.add = function (name, apiInfo) {
    if (apiInfoGroup[name]) {
      throw new Error(`API "${name}" already exists.`);
    }

    apiInfoGroup[name] = parseApiInfo(name, apiInfo, groupOptions); // 同前面一样存在运行时类型转换

    this[name] = createAPI(apiInfoGroup[name]);
    return this;
  };

  return self;
}
function config({
  querystring,
  paramRegex,
  immutable,
  client,
  reset,
  defaultType: dt
} = {
  reset: true
}) {
  isFn(querystring) && (globalQuerystring = querystring);
  paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
  globalIsArgsImmutable = immutable;
  globalClient = client;
  defaultType = dt;
  reset && (globalQuerystring = globalParamRegex = globalClient = defaultType = undefined, globalIsArgsImmutable = false);
}

const querystring = function (obj) {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    return Object.keys(obj).map(k => Array.isArray(obj[k]) ? obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v == null ? '' : v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k] == null ? '' : obj[k])}`).join('&');
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
