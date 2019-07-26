# apiz-ng

<!-- [START badges] -->
![Travis (.com) branch](https://img.shields.io/travis/com/ta7sudan/apiz-ng/master.svg) [![codecov](https://codecov.io/gh/ta7sudan/apiz-ng/branch/master/graph/badge.svg)](https://codecov.io/gh/ta7sudan/apiz-ng) ![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg) ![npm (tag)](https://img.shields.io/npm/v/apiz-ng/latest.svg)

<!-- [END badges] -->


这是一个实验性的项目, 旨在提供浏览器和 Node 环境统一的 API 管理方案. 因为用到了一些无法被 Babel 编译的特性, 比如 Proxy, 所以浏览器的支持度并不高, 不过考虑之后用类似思路实现一个支持较低版本浏览器的版本.



## Installation

```shell
$ npm i -P apiz-ng
```



## Usage

```shell
$ npm i -P apiz-ng apiz-browser-client
```

创建一个 group.js 作为 API 的配置文件.

```javascript
export default {
	baseURL: 'http://127.0.0.1:8080',
	apis: {
		getBook: {
			path: '/book/:bookName',
			pathParams: true
		}
	}
};
```

main.js

```javascript
import group from './group';
import apizClient from 'apiz-browser-client';
import { APIz, config } from 'apiz-ng';

const apis = new APIz(group, {
	client: apizClient()
});
const { getBook } = apis;
getBook({
	params: {
		bookName: 'CSAPP'
	},
    query: {
		query0: '000',
		query1: 111
    } 
}).then(data => {
	console.log(data);
});
// request http://127.0.0.1:8080/book/CSAPP?query0=000&query1=111
```

让我们先从 group.js 开始, `baseURL` 标识了该组中所有 API 的基本路径. 当然你也可以不在 group.js 中指定 `baseURL` 而是通过构造函数的选项指定, 比如.

```javascript
const group = {
	apis: {
		getBook: {
			path: '/book/:bookName',
			pathParams: true
		}
	}
};
const apis = new APIz(group, {
	baseURL: 'http://127.0.0.1:8080',
	client: apizClient()
});
```

你还可以指定其他的 HTTP 方法, 忽略大小写.

```javascript
export default {
	baseURL: 'http://127.0.0.1:8080',
    apis: {
		addBook: {
			path: '/book/:bookName',
			method: 'post',
			pathParams: true
		}
	}
};
```

APIz 本身并不负责发送请求, 它只负责处理路径参数和查询字符串. 而发送请求实际上是由 `APIzClient` 完成的, 它是一个接口, 意味着你可以用任何你喜欢的请求库, 比如 axios, 或者 jQuery, 也意味着它能够兼容浏览器和 Node 环境. 这里我们使用了 apiz-browser-client, 它和 apiz-ng 构成了浏览器环境下的 API 管理方案, 你也可以实现自己的 `APIzClient`.

默认情况下, APIz 实例化请求方法是 lazy load 的. 在这个例子中, 只有当你第一次调用 `getBook()` 的时候, `getBook()` 方法才会实例化并被缓存下来, 这些都是借助 `Proxy` 完成的. 这意味着即使你有上千个 API 配置, 实例化 APIz 对象也是非常快的, 这对于浏览器环境来说很有帮助, 它几乎不会对首屏渲染的时间产生什么影响. 而对于 Node 环境, lazy load 的开销也只有第一次调用时会稍稍慢一点, 之后方法会被缓存下来.

API 配置中我们使用了路径参数, 所以需要配置一个 `pathParams: true` 来提示 APIz 是否应当将 `getBook(arg0, arg1)` 中的 `arg0` 解释为路径参数. 注意一旦设置了 `pathParams` 为 `true` 的话, 则路径参数是必需的.



## API

### `APIz(group: APIGroup, options: APIzOptions)`

返回一个 APIz 实例 `apis`. `apis` 具有以下方法.

* `add(key: string, info: APIInfo)`, 添加一个新的 API. eg.

  ```javascript
  apis.add('updateBook', {
      path: '/book/:bookName',
      pathParams: true,
      method: 'patch'
  });
  apis.updateBook({
      body: {
          content: 'book content'
      },
      params: {
          bookName: 'SICP'
      },
      query: {
          query: '000',
          key: 'value'
      }
  });
  ```

* `remove(key: string)`, 从一组 API 中删除一个 API. 注意, 通过 `delete` 删除一个 API 是无效的, 因为 APIz 实例内部维护了一组 API 的元数据, 只要元数据中的 API 依然存在, 则每次访问相关属性的时候都会检测对应 API 方法是否存在并考虑是否实例化方法. eg.

  ```javascript
  delete apis.getBook;
  console.log(typeof apis.getBook === 'function'); // true
  apis.remove('getBook');
  console.log(typeof apis.getBook === 'function'); // false
  ```

* `interface APIzRequest`, HTTP 方法对应的请求方法, 如 `get()`, `post()` 等, 它的签名是

  ```typescript
  export interface APIzRequestOptions<ContentType> {
  	body?: any;
  	params?: Record<string, string>;
  	query?: string | Record<string, any>;
  	headers?: Record<string, any>;
  	type?: ContentType;
  	handleError?: boolean;
  }
  
  export interface APIzRequest<RawRequestOptions, ContentType, Meta> {
  	(options: APIzRequestOptions<ContentType> | RawRequestOptions, isRawOption?: boolean): Promise<
  		any
  	>;
  	readonly url: string;
	readonly method: HTTPMethodUpperCase;
  	readonly meta: Meta;
  	readonly type: ContentType;
  }
  ```
  

`body` 可以是任意类型, 支持的类型取决于 `APIzClient` 的实现, `type: ClientType` 也是由 `APIzClient` 提供, 默认是一个字符串. 这样你可以传入类型为 `Buffer` 或 `ArrayBuffer` 的 `body` 也不会有什么问题, `type` 用来提示 `APIzClient` 应当如何序列化 `body` 或正确地设置 `Content-Type`.

`query` 可以是对象也可以是字符串, eg. `"key0=000&key1=111"`.

`handleError` 的值用来提示是否优先全局异常处理, 如果 `true`, 则先触发全局异常处理, 但是也依然会继续抛出异常, 如果 `false` 则不触发全局异常处理, 并抛出异常.



APIz 的设计原则是不屏蔽任何底层信息, 所以如果你希望获取到对底层完整的配置权, 可以提供一个 `isRawOption` 参数. 比如当你希望为请求配置 header 的时候.

```javascript
apis.getBook({
    headers: {
        'Accept': 'application/json',
        'Auth': 'username=aaa;password=bbb'
    }
}, true);
```

你不需要额外的配置, 只需要传入第二个参数为 `true`, 作为标记提示 APIz 将第一个参数解释成完整配置, 而不是 `body`, `params` 或 `query`.

`RawRequestOptions` 由实现的 `APIzClient` 提供, 暴露底层请求库的配置选项.

这些重载方法还带有以下只读属性, 同 `APIInfo`.

* `url`
* `method`
* `type`
* `meta`



### `APIGroup`

`APIGroup` 包含两个属性 `baseURL` 和 `apis`.

`baseURL` 用来配置该组 API 的 `hostname`, `port` 等, 有利于减少重复内容. 不过它不是必需的, 我们还可以通过 `APIzOptions` 在实例化的时候配置该组 API 的 `baseURL`.

`apis` 是一个 Object, 用来配置一组 API, API 可以是任意名字, 除了 `remove` 和 `add` 会被作为保留字, 配置的名字会被作为 APIz 实例上的一个方法, 如前面的 `apis.getBook()`.

`apis` 中的每个属性都是一个 `APIInfo` 对象.



### `APIInfo`

`APIInfo是一个 Object, 用来描述一个 API 的必要信息. 支持以下字段.

* `url`, string, 一个 API 的完整 URL, 一旦设置了它, 会忽略下面的 `baseURL` 和 `path` 以及该组的 `baseURL` 和 `APIzOptions` 中的 `baseURL`
* `baseURL`, string, 它的优先级大于该组配置的 `baseURL` 和 `APIzOptions` 中的 `baseURL`
* `path`, string, 路径, 被拼接在 `baseURL` 之后, 以 `/` 开头, 支持 `/:demo` 这样的路径参数, 默认匹配 `/(?<=\/):((\w|-)+)/g`, 可以通过 `paramRegex` 改变默认的正则匹配
* `method`, string, 指定该 API 的 HTTP method, 默认 `GET`, 忽略大小写, APIz 只支持 `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD` 七种方法, 和浏览器一样, 对于 `CONNECT`, `TRACE` 之类的不作支持
* `type`, string, 指定该 API 的 body 的默认 `type`, 可以是任意字符串, APIz 本身不设置任何 `type`, 支持的 `type` 由 `APIzClient` 决定, 仅对带 body 的请求方法有意义, 在调用带 body 的请求的时候可以省略 `type` 默认使用这里指定的 `type`
* `meta`, 任意类型, 用来自定义一些配置, 会被传递给 `APIzClient`



### `APIzOptions`

作为 APIz 构造函数的第二个参数, 是一个 Object, 支持以下字段.

* `baseURL`, 同 `APIGroup` 中的 `baseURL`, 不过它的优先级高一些, 优先级是 `APIInfo.baseURL` > `APIzOptions.baseURL` > `APIGroup.baseURL`
* `client`, 为该组 API 指定一个 `APIzClient` 实例
* `immutable`, 用来指定传入构造函数的 `APIGroup` 实例在之后是否会改变, 以及是否允许 APIz 修改传入的 `APIGroup` 对象. 默认情况下, APIz 不会修改传入的 `APIGroup` 对象, 这意味着为了维护一个内部的 API 元数据, 需要在初始化的时候扫描整个 `APIGroup` 对象并根据这些信息在内部生成一个新的完整的元数据对象, 如果 `APIGroup` 中包含了上千个 API 配置, 则这样也会有一定开销. 如果设置 `immutable` 为 `true`, 意味着告诉 APIz `APIGroup` 对象在之后不会被修改, 并且允许 APIz 修改 `APIGroup` 对象, 这样 APIz 在初始化的时候就可以不用扫描整个 `APIGroup`, 而是在 API 方法被调用时才逐渐创建内部的元数据对象.
* `querystring(obj)`, 一个序列化查询字符串的方法, APIz 默认内置了一个 `querystring()` 方法, 但你也可以替换掉它. 默认的序列化方法会将数组 `arr = [1, 2, 3]` 序列化成 `arr=1&arr=2&arr=3` 这样的形式, 可能有人希望能序列化成 PHP 常用的 `arr[]=1&arr[]=2&arr[]=3`, 这种时候它会有用
* `paramRegex`, 一个 RegExp, 为该组 API 指定用来匹配路径参数的正则表达式, 所以你可以自己定义路径参数的格式, 比如设置 `paramRegex` 为 `/{(\w+)}/g`, 则 `APIInfo` 中可以使用 `/{demo}` 这样的形式



## `config(options: GlobalOptions)`

`config()` 方法会为所有 APIz 实例配置一些选项, 这样的话如果有多个 APIz 实例, 即多组 API 的话, 可以不用每个都传入第二个参数 `APIzOptions`. `GlobalOptions` 支持的字段和 `APIzOptions` 类似.

* `client`, 为所有 APIz 实例指定一个 `APIzClient` 对象
* `immutable`, 为所有 APIz 实例指定 `immutable`
* `paramRegex`, 为所有 APIz 实例指定用来匹配路径参数的正则表达式
* `querystring(obj)`, 为所有 APIz 实例指定 `querystring` 方法
* `defaultType`, 为所有 `APIInfo` 指定默认的 `type`, 这样的话在配置 `APIInfo` 的时候也可以省略 `type`, 注意它和 `APIInfo` 中 `type` 的区别. 指定 `defaultType` 是可以在配置 `APIInfo` 的时候省略 `type`, 指定 `APIInfo` 的 `type` 是在调用带 body 的请求方法的时候可以省略 `type`



## `APIzClient`

一个接口, 是实现底层 HTTP 请求库和 APIz 之间的桥梁, 也是浏览器环境和 Node 环境通用方案的保障. 实际的请求发送都由它来完成.

实现一个 `APIzClient` 也很简单, 就是一个普通的对象带有以下方法, 以下方法都是可选的

* `get(opts)`, 返回一个 `Promise`, `opts` 有以下字段:
  * `url` APIz 会处理好路径参数和查询字符串, 最终的 URL 会被作为 `url` 参数传入
  * `name` `APIGroup.apis` 中配置的 key 的值
  * `meta` `APIInfo` 中的 `meta` 会在这里被传入
  * `options` 如果以 `(rawRequestOptions: RawRequestOptions, optionsFlag: boolean): Promise<any>` 的形式调用, 则会传入 `options` 参数
* `head(opts)`, 同 `get()`
* `delete(opts)`, 同 `get()`
* `options(opts)`, 同 `get()`
* `post(opts)`, 返回一个 `Promise`, `opts` 有以下字段:
  * `url` APIz 会处理好路径参数和查询字符串, 最终的 URL 会被作为 `url` 参数传入
  * `type` body 指定的 `type`, 用来提示 body 的类型, 实现者可以根据 `type` 决定如何序列化 body 以及如何设置 `Content-Type`, 由实现者自己决定支持 `type` 的值
  * `name` `APIGroup.apis` 中配置的 key 的值
  * `meta` `APIInfo` 中的 `meta` 会在这里被传入
  * `body` 当以带 body 的形式调用时, body 被作为该字段传入, 此时 `options` 为 `undefined`
  * `options` 当以 `(rawRequestOptions: RawRequestOptions, optionsFlag: boolean): Promise<any>` 形式调用时, 底层请求库的原始 options 被作为 `options` 传入, 此时 `body` 为 `undefined`
* `put(opts)`, 同 `post()`
* `patch(opts)`, 同 `post()`

以下是 Node 环境基于 [got](https://github.com/sindresorhus/got) 实现的 `APIzClient` 的例子.

```:de:
const got = require('got');
const { Readable } = require('stream');

const MIME = {
	json: 'application/json',
	form: 'application/x-www-form-urlencoded'
};

function request({ url, method, type, data, retry = 0, options = {}, beforeRequest, afterResponse }) {
	let hooks = {};
	if (data instanceof Buffer || data instanceof Readable) {
		options.body = data;
		if (MIME[type]) {
			options.headers = {
				'Content-Type': MIME[type]
			};
		}
	} else if (data) {
		options.body = data;
		if (type === 'json') {
			options.json = true;
		} else if (type === 'form') {
			options.form = true;
		}
	}

	if (Array.isArray(beforeRequest)) {
		hooks.beforeRequest = beforeRequest;
	}
	if (Array.isArray(afterResponse)) {
		hooks.afterResponse = afterResponse;
	}
	options.hooks = hooks;
	options.method = method;
	options.retry = retry;
	return got(url, options);
}

/**
 * { beforeRequest, afterResponse, retry }
 */
module.exports = function (opts = {}) {
	return {
		...['get', 'head'].reduce((prev, cur) =>
			(prev[cur] = ({ name, meta, url, options }) => request({
				...opts,
				url,
				method: cur.toUpperCase(),
				options
			}), prev), {}),
		...['post', 'put', 'patch', 'delete', 'options'].reduce((prev, cur) =>
			(prev[cur] = ({ name, meta, url, body, options, type }) => request({
				...opts,
				url,
				type,
				options,
				method: cur.toUpperCase(),
				data: body
			}), prev), {})
	};
};
```

这样可以方便地实现一些自己想要的 hook, 使用时只需要

```:deciduous_tree:
const apizClient = require('apiz-node-client);
const { APIz, config} = require('apiz-ng');
const meta = require('./meta');

config({
    client: apizClient()
});

const apis = new APIz(meta);
```

目前默认的浏览器环境的 `APIzClient` 实现是 [apiz-browser-client](https://www.npmjs.com/package/apiz-browser-client), Node 环境的实现 [apiz-node-client](https://www.npmjs.com/package/apiz-node-client).



## TODO

因为 APIz 实例上的方法都是 lazy load 的, 所以通过 `Object.keys()` 来获取所有方法是不现实的, 目前也没有方法可以遍历到所有的方法, 所以考虑之后提供一个 API 暴露所有方法名.



## Misc

建议将 API 的配置分成多个文件, 存放在单独的目录, 通过扫描目录读取文件合并成一个 `APIGroup` 对象.

需要注意的是, 在合并过程中建议对可能存在的重复属性名做检测. 受限于 JavaScript 语言特性, APIz 没有办法对同一个对象中的重名属性做检测, 因为在运行时获取到的对象是不会存在重复属性的, 可能某些版本 ES5 的严格模式下会报错, 但是 ES6 又改了, 不再对对象的重复属性报错了. 所以建议对此类情况使用 eslint 在编写代码的过程中进行检测.

如果不在意初始化开销, 也可以使用 `add()` 方法一个个添加, 这样的话 APIz 可以检测到已存在的同名 API 方法.

对于前端项目, 建议使用 Webpack 的 `require.context()` 或 [babel-plugin-static-fs](https://www.npmjs.com/package/babel-plugin-static-fs) 在编译时扫描目录合并对象, 也可以考虑编写 Webpack 插件实现. 不过这个 Babel 插件可能会因为 Babel 缓存导致开发时新添加的文件没有被扫描到, 后续考虑自己撸个配套插件.