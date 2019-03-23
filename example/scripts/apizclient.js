(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.apizclient = factory());
}(this, function () { 'use strict';

  const isFn = fn => typeof fn === 'function';

  const isJSON = cType => /application\/json/i.test(cType);

  const isForm = cType => /application\/x-www-form-urlencoded/i.test(cType);

  const isStr = v => v && typeof v === 'string';

  const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

  const lc = window.location;
  const xhrPool = [],
        // tslint:disable-next-line
  ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor,
        // 为什么这里不用字符串枚举?
  // 因为枚举的反查带来不必要的开销, 而const枚举
  // 又会在编译时内联, 不能使用key索引查找值,
  // 另一方面又希望有一些类型检查, 所以折中这样
  MIME = {
    json: 'application/json',
    form: 'application/x-www-form-urlencoded',
    html: 'text/html',
    xml: 'application/xml',
    text: 'text/plain'
  },
        events = ['onloadstart', 'onprogress', 'onabort', 'onerror', 'onload', 'ontimeout', 'onloadend', 'onreadystatechange'];
  let cacheRand = Date.now() + 5,
      globalSerialize = null,
      globalDeserialize = null;

  function createXhr() {
    // 不用class继承, 省得编译出来多一个函数
    const xhr = new XMLHttpRequest();
    Object.defineProperty(xhr, '_active', {
      value: false,
      writable: true,
      enumerable: false
    });

    return xhr;
  }

  function resetXhr(xhr) {
    // responseType, withCredentials以及header相关的会在open后重置
    xhr._active = false; // 可能是同步请求那就不能设置timeout

    try {
      xhr.timeout = 0;
      xhr.requestURL = ''; // tslint:disable-next-line
    } catch (e) {}

    events.forEach(v => xhr[v] = null); // 这里不建议给XMLHttpRequestUpload patch一个索引类型, 可能影响到其他地方

    xhr.upload && events.forEach(v => xhr.upload[v] = null);
  }

  function xhrFactory() {
    for (let i = 0, len = xhrPool.length; i < len; ++i) {
      if (!xhrPool[i]._active) {
        return xhrPool[i];
      }
    }

    return createXhr();
  }

  function querystring(obj) {
    if (isObj(obj)) {
      return Object.keys(obj).map(k => Array.isArray(obj[k]) ? obj[k].map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
    } else {
      return JSON.stringify(obj);
    }
  }

  const defaultSerialize = ({
    data,
    method,
    contentType = MIME.json,
    url,
    cache
  }) => {
    if (!cache) {
      // 字符串不可变, 所以这里懒得起名了, 赋值url其实不影响外部
      // tslint:disable-next-line
      url += ~url.indexOf('?') ? `&_=${++cacheRand}` : `?_=${++cacheRand}`;
    }

    if (method === 'GET' || method === 'HEAD') {
      return {
        url,
        data
      };
    }

    if (data instanceof Document || // URLSearchParams和ReadableStream暂时不考虑支持了, 浏览器版本要求比较高
    // data instanceof URLSearchParams ||
    // data instanceof ReadableStream ||
    data instanceof Blob || data instanceof FormData || data instanceof ArrayBuffer || data instanceof ArrayBufferView || typeof data === 'string') {
      return {
        url,
        data
      };
    }

    let resultData = null;

    if (isJSON(contentType)) {
      resultData = JSON.stringify(data);
    } else if (isForm(contentType)) {
      resultData = querystring(data);
    } else {
      throw new TypeError('Unknown data type, you can provide a custom serialize function in options to override the default.');
    }

    return {
      url,
      data: resultData
    };
  };

  const defaultDeserialize = ({
    data,
    contentType,
    acceptType
  }) => {
    let rst = null;

    if (isStr(data) && (isStr(contentType) && isJSON(contentType) || isJSON(acceptType))) {
      try {
        rst = JSON.parse(data);
      } catch (e) {
        console.error('Invalid json string');
        rst = data;
      }
    } else {
      rst = data;
    }

    return rst;
  };

  function setHeaders(xhr, headers) {
    if (isObj(headers)) {
      Object.keys(headers).forEach(k => xhr.setRequestHeader(k, headers[k]));
    }
  }

  function setEvents(target, evts) {
    if (isObj(evts) && target) {
      // 不用addEventListener是它不方便reset
      Object.keys(evts).filter(k => events.indexOf(k) !== -1).forEach(k => target[k] = evts[k]);
    }
  }

  function getResponse(xhr, key) {
    // 在有responseType的情况下, 访问responseXML, responseText等都有可能抛出异常
    try {
      return xhr[key];
    } catch (e) {
      return null;
    }
  }

  function ajax(opts) {
    let {
      url = lc.href,
      method = 'GET',
      contentType: reqCtype,
      dataType: acceptType = 'json',

      /* tslint:disable */
      data: reqRawData,
      beforeSend,
      complete,
      error,
      headers,
      mimeType,
      responseType = '',
      username,
      password,
      success,
      timeout = 0,
      ontimeout,
      events,
      uploadEvents,
      withCredentials = false,
      cache = true,
      serialize,
      deserialize
      /* tslint:enable */

    } = opts;
    method = method.toUpperCase().trim(); // IE是什么...
    // xhr不支持CONNECT, TRACE, TRACK方法

    if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].indexOf(method) !== -1)) {
      throw new Error(`Invalid HTTP method: ${method}`);
    } // 允许所有callback都没有
    // 准备数据


    if (isStr(reqCtype)) {
      MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
    } else if (reqCtype) {
      throw new TypeError('contentType could be "json", "form", "html", "xml", "text" or other custom string.');
    }

    const slz = isFn(serialize) ? serialize : isFn(globalSerialize) ? globalSerialize : defaultSerialize,
          dslz = isFn(deserialize) ? deserialize : isFn(globalDeserialize) ? globalDeserialize : defaultDeserialize,
          maybeProtocol = /^([\w-]+:)\/\//.exec(url),
          hrefProtocol = /^(https?):\/\//.exec(lc.href),
          protocol = maybeProtocol ? maybeProtocol[1] : hrefProtocol ? hrefProtocol[1] : null,
          xhr = xhrFactory(),
          hasCompleteCb = isFn(complete),
          hasErrorCb = isFn(error),
          hasSuccessCb = isFn(success);
    let reqData,
        errCalled = false,
        completeCalled = false; // 这里不用捕获异常去重置xhr是因为xhr还没激活

    ({
      url,
      data: reqData
    } = slz({
      data: reqRawData,
      method,
      contentType: reqCtype,
      url,
      cache
    })); // 初始化xhr

    xhr._active = true;
    xhr.open(method, url, true, username, password);
    !xhr.requestURL && (xhr.requestURL = url); // 设置必要的头部

    if (reqCtype) {
      xhr.setRequestHeader('Content-Type', reqCtype);
    } else if (isStr(reqData)) {
      // 不在默认参数设json是为了让FormData之类的能够由浏览器自己设置
      // 这里只对字符串的body设置默认为json
      xhr.setRequestHeader('Content-Type', MIME.json);
    }

    if (isStr(acceptType)) {
      MIME[acceptType] && (acceptType = MIME[acceptType]);
      xhr.setRequestHeader('Accept', acceptType);
    }

    setHeaders(xhr, headers);
    isStr(mimeType) && xhr.overrideMimeType(mimeType); // 主要是给progress等事件用, 但存在破坏封装的风险

    setEvents(xhr, events);
    setEvents(xhr.upload, uploadEvents);
    withCredentials && (xhr.withCredentials = withCredentials);
    responseType && (xhr.responseType = responseType);
    timeout && (xhr.timeout = timeout);

    if (isFn(ontimeout)) {
      xhr.ontimeout = function (e) {
        ontimeout(e);
        hasCompleteCb && complete(this, 'timeout');
      };
    } else if (timeout && !isFn(xhr.ontimeout)) {
      xhr.ontimeout = function () {
        if (hasCompleteCb) {
          complete(this, 'timeout');
        } else {
          // 如果没监听ontimeout但是设置了timeout, window.onerror不会捕获这个错误, 所以手动抛个
          throw new Error(`Request ${this.requestURL} timeout.`);
        }
      };
    } // loadend无论同步还是异步请求, 无论前面的事件是否抛异常, 它都会执行


    if (isFn(xhr.onloadend)) {
      const originalLoadend = xhr.onloadend;

      xhr.onloadend = function (e) {
        resetXhr(this);
        originalLoadend.call(this, e);
      };
    } else {
      xhr.onloadend = function () {
        resetXhr(this);
      };
    } // 覆盖掉用户自定义onreadystatechange


    xhr.onreadystatechange = function (e) {
      if (this.readyState === 4) {
        const resCtype = this.getResponseHeader('Content-Type'); // 这里也不用捕获异常, 因为xhr.onloadend会在之后帮我们回收xhr

        const resData = dslz({
          data: getResponse(xhr, 'responseXML') || getResponse(xhr, 'response') || getResponse(xhr, 'responseText'),
          contentType: resCtype,
          acceptType
        });

        if (this.status >= 200 && this.status < 300 || this.status === 304 || this.status === 0 && protocol === 'file:') {
          // 异常直接抛
          hasSuccessCb && success(resData, this, e);
          hasCompleteCb && complete(this, 'success');
        } else if (this.status !== 0) {
          // 这类错误xhr.onerror和window.onerror都不捕获所以手动抛一个
          if (!hasErrorCb && !hasCompleteCb) {
            throw new Error(`Remote server error. Request URL: ${this.requestURL}, Status code: ${this.status}, message: ${this.statusText}, response: ${this.responseText}.`);
          } // 理论上来讲好像没必要再注册xhr.onerror了, 因为如果有error那status必然为0
          // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
          // 但是不加个心里不踏实...总感觉会不会有浏览器没按规范实现
          // 不过知名的库页都没监听onerror, 那说明应该是都按规范实现了的
          // 但是我要加!!!


          if (hasErrorCb) {
            errCalled = true;
            error(new Error(`Remote server error. Request URL: ${this.requestURL}, Status code: ${this.status}, message: ${this.statusText}, response: ${this.responseText}.`), resData, this, e);
          }

          if (hasCompleteCb) {
            completeCalled = true;
            complete(this, 'error');
          }
        }
      }
    }; // 覆盖


    xhr.onerror = function (e) {
      // 跨域错误会在这里捕获, 但是window.onerror不捕获, 所以也手动抛一个
      if (!hasErrorCb && !hasCompleteCb) {
        throw new Error(`An error occurred, maybe crossorigin error. Request URL: ${this.requestURL}, Status code: ${this.status}.`);
      }

      if (!errCalled && hasErrorCb) {
        error(new Error(`Network error or browser restricted. Request URL: ${this.requestURL}, Status code: ${this.status}`), undefined, this, e);
      }

      if (!completeCalled && hasCompleteCb) {
        complete(this, 'error');
      }
    }; // 哎...都异步吧


    if (isFn(beforeSend)) {
      setTimeout(() => {
        let rst;

        try {
          rst = beforeSend(xhr, opts);
        } catch (e) {
          // 恶心之处就在于每个用户定义的callback都可能触发异常, 然而我还要回收xhr
          resetXhr(xhr);
          throw e;
        }

        if (rst !== false) {
          xhr.send(reqData || null);
        } else {
          resetXhr(xhr);
        }
      });
    } else {
      xhr.send(reqData || null);
    } // 不暴露xhr


    return {
      abort() {
        xhr.abort();
      }

    };
  }

  /* global false */

  const retryMap = {},
        isFn$1 = f => typeof f === 'function';

  let reqId = Date.now();

  function request(opts) {
    // tslint:disable-next-line
    let {
      url,
      method,
      type,
      data,
      beforeSend,
      afterResponse,
      complete,
      retry = 0,
      options = {},
      id = ++reqId
    } = opts,
        reqData;
    retryMap[id] = -~retryMap[id];
    opts.id = id;

    if (data) {
      reqData = options.data = data;
      options.contentType = type;
    }

    options.url = url;
    options.method = method;
    return new Promise((rs, rj) => {
      ajax(Object.assign({
        beforeSend,

        // $防止遮蔽
        success($data, xhr) {
          delete retryMap[id]; // 算了, 这个异常还是让它直接crash掉吧, 和后面保持一致

          isFn$1(afterResponse) && afterResponse($data, 'success', xhr, url, reqData);
          rs({
            data: $data,

            next() {
              isFn$1(complete) && complete($data, xhr, url, reqData);
            }

          });
        },

        // $防止遮蔽
        error(err, $data, xhr) {
          if (retryMap[id] < retry + 1) {
            rs(request(opts));
          } else {
            delete retryMap[id];
            isFn$1(afterResponse) && afterResponse($data, 'error', xhr, url, reqData);
            rj({
              err,

              next() {
                isFn$1(complete) && complete(undefined, xhr, url, reqData);
              }

            });
          }
        }

      }, options));
    });
  }
  /**
   * { beforeSend, afterResponse, retry }
   */


  function index (opts = {}) {
    return Object.assign({}, ['get', 'head'].reduce((prev, cur) => (prev[cur] = ({
      name,
      meta,
      url,
      options
    }) => request(Object.assign({}, opts, {
      url,
      method: cur.toUpperCase(),
      options
    })), prev), {}), ['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) => (prev[cur] = ({
      name,
      meta,
      url,
      body,
      options,
      type
    }) => request(Object.assign({}, opts, {
      url,
      type,
      options,
      method: cur.toUpperCase(),
      data: body
    })), prev), {}));
  }

  var meta = {
    _baseURL: 'http://127.0.0.1:8080',
    getBook: {
      path: '/book/:bookName',
      pathParams: true
    },
    queryBook: {
      path: '/book/:bookName',
      pathParams: true,
      method: 'head'
    },
    addBook: {
      path: '/book',
      method: 'post',
      type: 'json'
    },
    updateBook: {
      path: '/book/:bookName',
      method: 'put',
      pathParams: true,
      type: 'json'
    },
    modifyBook: {
      path: '/book/:bookName',
      method: 'patch',
      pathParams: true,
      type: 'json'
    },
    removeBook: {
      path: '/book/:bookName',
      method: 'delete',
      pathParams: true,
      type: 'json'
    },
    optionsBook: {
      path: '/book/:bookName',
      method: 'options',
      pathParams: true,
      type: 'json'
    }
  };

  index();
  window.meta = meta;

  return index;

}));
//# sourceMappingURL=apizclient.js.map
