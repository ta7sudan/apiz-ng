## API

### `APIz(meta: APIMeta, options: GroupOptions)`

返回一个 APIz 实例 `apis`. `apis` 具有以下方法.

- `add(key: string, info: APIInfo)`, 添加一个新的 API. eg.

  ```javascript
  apis.add('updateBook', {
      path: '/book/:bookName',
      pathParams: true,
      method: 'patch'
  });
  apis.updateBook({
      content: 'book content'
  }, {
      bookName: 'SICP'
  }, {
      query: '000',
      key: 'value'
  });
  ```

- `remove(key: string)`, 从一组 API 中删除一个 API. 注意, 通过 `delete` 删除一个 API 是无效的, 因为 APIz 实例内部维护了一组 API 的元数据, 只要元数据中的 API 依然存在, 则每次访问相关属性的时候都会检测对应 API 方法是否存在并考虑是否实例化方法. eg.

  ```javascript
  delete apis.getBook;
  console.log(typeof apis.getBook === 'function'); // true
  apis.remove('getBook');
  console.log(typeof apis.getBook === 'function'); // false
  ```

- `<requestMethod>()`, 根据 `APIMeta` 中的配置实例化的方法. 根据请求是否带 body, 可以分为 `APIzBodyRequest` 和 `APIzNoBodyRequest` 两类, 但是还有一类是 `APIzRawOptionsRequest`



### `APIzBodyRequest(body: any, params?: object, query?: string|object, type?: string):Promise<any>`

对于带 body 的请求, `body` 是必需的, 如果不需要, 可以传 `null`. 其他参数都是可选的, `params` 作为路径参数, `query` 作为查询字符串, `type` 用来指定 body 的类型. 意味着你可以以下面这几种形式调用, 而不需要传递多余的参数.

- `apis.addBook(body, params, query, type)`
- `apis.addBook(body, params, query)`
- `apis.addBook(body, params, type)`
- `apis.addBook(body, params)`
- `apis.addBook(body, query, type)`
- `apis.addBook(body, query)`
- `apis.addBook(body, type)`
- `apis.addBook(body)`

`body` 可以是任意类型, 支持的类型取决于 `APIzClient` 的实现, `type` 也可以是任意字符串, 同样由 `APIzClient` 提供, 这样你可以传入类型为 `Buffer` 或 `ArrayBuffer` 的 `body` 也不会有什么问题, `type` 用来提示 `APIzClient` 应当如何序列化 `body` 或正确地设置 `Content-Type`.

如果配置了 `pathParams: true`, 则 `params` 会被解释成路径参数.

`query` 可以是对象也可以是字符串, eg. `"key0=000&key1=111"`.

函数返回一个 `Promise`. 只有 `POST`, `PUT`, `PATCH` 的方法会被实例化成 `APIzBodyRequest`, 尽管浏览器上支持 `DELETE` 和 `OPTIONS` 请求携带 body, 但是考虑到这样的场景比较少, 避免在大多数情况下不需要 body 的时候必须手动传入一个无意义的 `null`, 所以还是将 `DELETE` 和 `OPTIONS` 设计成不带 body 的. 另一方面是可能有一些服务端不支持 `DELETE` 携带 body, 参考 https://stackoverflow.com/questions/299628/is-an-entity-body-allowed-for-an-http-delete-request.

也许以后会考虑提供配置选项来指定哪些方法会被实例化成允许带 body 的.



### `APIzNoBodyRequest(params?: object, query?: string|object): Promise<any>`

和 `APIzBodyRequest` 类似, 但是作为不需要携带 body 的请求, `APIzNoBodyRequest` 方法不需要 `body` 和 `type` 参数, 所以只会有以下几种调用形式.

- `apis.getBook(params, query)`
- `apis.getBook(params)`
- `apis.getBook(query)`
- `apis.getBook()`

同样, 仅在配置了 `pathParams: true` 的时候才会存在包含 `params` 的调用形式.

函数返回一个 `Promise`. 只有 `GET`, `HEAD`, `DELETE`, `OPTIONS` 的 API 会被实例化成 `APIzNoBodyRequest`. 尽管 HTTP 规范并没有限制 `GET` `DELETE` `OPTIONS` 是否可以带 body, 但是还是根据大多数场景以及大多数人的习惯, APIz 将它们设计成不带 body 的请求.



### `APIzRawOptionsRequest(options: object, flag: boolean):Promise<any>`

APIz 的设计原则是不屏蔽任何底层信息, 所以如果你希望获取到对底层完整的配置权, 这种形式是很有帮助的. 比如当你希望为请求配置 header 的时候.

```javascript
apis.getBook({
    headers: {
        'Accept': 'application/json',
        'Auth': 'username=aaa;password=bbb'
    }
}, true);
```

每个 `APIzBodyRequest` 和 `APIzNoBodyRequest` 都继承自 `APIzRawOptionsRequest`, 所以你不需要额外的配置, 只需要传入第二个参数为 `true`, 作为标记提示 APIz 将第一个参数解释成完整配置, 而不是 `body`, `params` 或 `query`.

`options` 支持的字段取决于底层 `APIzClient` 的实现. 

`APIzRawOptionsRequest` 还带有以下只读属性, 同 `APIInfo`.

- `url`
- `method`
- `type`
- `pathParams`
- `meta`



### `APIzMeta`

`APIzMeta` 是一个 Object, 用来配置一组 API, API 可以是任意名字, 除了 `_baseURL`, 配置的名字会被作为 APIz 实例上的一个方法, 如前面的 `apis.getBook()`.

`_baseURL` 被作为 `APIzMeta` 属性中唯一一个保留名字, 用来配置该组 API 的 `hostname`, `port` 等, 有利于减少重复内容. 不过它不是必需的, 我们还可以通过 `GroupOptions` 在实例化的时候配置该组 API 的 `baseURL`.

`APIzMeta` 中的每个属性都是一个 `APIInfo` 对象.



### `APIInfo`

`APIInfo` 是一个 Object, 用来描述一个 API 的必要信息. 支持以下字段.

- `url`, string, 一个 API 的完整 URL, 一旦设置了它, 会忽略下面的 `baseURL` 和 `path` 以及该组的 `_baseURL` 和 `GroupOptions` 中的 `baseURL`
- `baseURL`, string, 它的优先级大于该组配置的 `_baseURL` 和 `GroupOptions` 中的 `baseURL`
- `path`, string, 路径, 被拼接在 `baseURL` 之后, 以 `/` 开头, 支持 `/:demo` 这样的路径参数, 默认匹配 `/(?<=\/):((\w|-)+)/g`, 可以通过 `paramRegex` 改变默认的正则匹配
- `method`, string, 指定该 API 的 HTTP method, 默认 `GET`, 忽略大小写, APIz 只支持 `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD` 七种方法, 和浏览器一样, 对于 `CONNECT`, `TRACE` 之类的不作支持
- `type`, string, 指定该 API 的 body 的默认 `type`, 可以是任意字符串, APIz 本身不设置任何 `type`, 支持的 `type` 由 `APIzClient` 决定, 仅对 `APIzBodyRequest` 有意义, 在调用 `APIzBodyRequest` 的时候可以省略 `type` 默认使用这里指定的 `type`
- `pathParams`, boolean, 指示是否使用路径参数, 一旦指定则 `APIzBodyRequest` 和 `APIzNoBodyRequest` 调用时必须指定 `params`
- `meta`, 任意类型, 用来自定义一些配置, 会被传递给 `APIzClient`



### `GroupOptions`

作为 APIz 构造函数的第二个参数, 是一个 Object, 支持以下字段.

- `baseURL`, 同 `APIMeta` 中的 `_baseURL`, 不过它的优先级高一些, 优先级是 `APIInfo.baseURL` > `GroupOptions.baseURL` > `APIMeta._baseURL`
- `client`, 为该组 API 指定一个 `APIzClient` 实例
- `immutableMeta`, 用来指定传入构造函数的 `APIMeta` 实例在之后是否会改变, 以及是否允许 APIz 修改传入的 `APIMeta` 对象. 默认情况下, APIz 不会修改传入的 `APIMeta` 对象, 这意味着为了维护一个内部的 API 元数据, 需要在初始化的时候扫描整个 `APIMeta` 对象并根据这些信息在内部生成一个新的完整的元数据对象, 如果 `APIMeta` 中包含了上千个 API 配置, 则这样也会有一定开销. 如果设置 `immutableMeta` 为 `true`, 意味着告诉 APIz `APIMeta` 对象在之后不会被修改, 并且允许 APIz 修改 `APIMeta` 对象, 这样 APIz 在初始化的时候就可以不用扫描整个 `APIMeta`, 而是在 API 方法被调用时才逐渐创建内部的元数据对象.
- `querystring(obj)`, 一个序列化查询字符串的方法, APIz 默认内置了一个 `querystring()` 方法, 但你也可以替换掉它. 默认的序列化方法会将数组 `arr = [1, 2, 3]` 序列化成 `arr=1&arr=2&arr=3` 这样的形式, 可能有人希望能序列化成 PHP 常用的 `arr[]=1&arr[]=2&arr[]=3`, 这种时候它会有用
- `paramRegex`, 一个 RegExp, 为该组 API 指定用来匹配路径参数的正则表达式, 所以你可以自己定义路径参数的格式, 比如设置 `paramRegex` 为 `/{(\w+)}/g`, 则 `APIInfo` 中可以使用 `/{demo}` 这样的形式



## `config(options: GlobalOptions)`

`config()` 方法会为所有 APIz 实例配置一些选项, 这样的话如果有多个 APIz 实例, 即多组 API 的话, 可以不用每个都传入第二个参数 `GroupOptions`. `GlobalOptions` 支持的字段和 `GroupOptions` 类似.

- `client`, 为所有 APIz 实例指定一个 `APIzClient` 对象
- `immutableMeta`, 为所有 APIz 实例指定 `immutableMeta`
- `paramRegex`, 为所有 APIz 实例指定用来匹配路径参数的正则表达式
- `querystring(obj)`, 为所有 APIz 实例指定 `querystring` 方法
- `defaultType`, 为所有 `APIInfo` 指定默认的 `type`, 这样的话在配置 `APIInfo` 的时候也可以省略 `type`, 注意它和 `APIInfo` 中 `type` 的区别. 指定 `defaultType` 是可以在配置 `APIInfo` 的时候省略 `type`, 指定 `APIInfo` 的 `type` 是在调用 `APIzBodyRequest` 的时候可以省略 `type`



## `APIzClient`

一个接口, 是实现底层 HTTP 请求库和 APIz 之间的桥梁, 也是浏览器环境和 Node 环境通用方案的保障. 实际的请求发送都由它来完成.

实现一个 `APIzClient` 也很简单, 就是一个普通的对象带有以下方法, 以下方法都是可选的

- `get(opts)`, 返回一个 `Promise`, `opts` 有以下字段:
  - `url` APIz 会处理好路径参数和查询字符串, 最终的 URL 会被作为 `url` 参数传入
  - `name` `APIzMeta` 中配置的 key 的值
  - `meta` `APIInfo` 中的 `meta` 会在这里被传入
  - `options` 如果以 `APIzRawOptionsRequest` 的形式调用, 则会传入 `options` 参数
- `head(opts)`, 同 `get()`
- `delete(opts)`, 同 `get()`
- `options(opts)`, 同 `get()`
- `post(opts)`, 返回一个 `Promise`, `opts` 有以下字段:
  - `url` APIz 会处理好路径参数和查询字符串, 最终的 URL 会被作为 `url` 参数传入
  - `type` body 指定的 `type`, 用来提示 body 的类型, 实现者可以根据 `type` 决定如何序列化 body 以及如何设置 `Content-Type`, 由实现者自己决定支持 `type` 的值
  - `name` `APIzMeta` 中配置的 key 的值
  - `meta` `APIInfo` 中的 `meta` 会在这里被传入
  - `body` 当以 `APIzBodyRequest` 形式调用时, body 被作为该字段传入, 此时 `options` 为 `undefined`
  - `options` 当以 `APIzRawOptionsRequest` 形式调用时, 底层请求库的原始 options 被作为 `options` 传入, 此时 `body` 为 `undefined`
- `put(opts)`, 同 `post()`
- `patch(opts)`, 同 `post()`

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