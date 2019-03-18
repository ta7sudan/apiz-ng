/* global DEBUG */
import { Omit } from 'type-fest';

export type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';

type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;

type Callable = (...args: Array<any>) => any;

// from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

interface KVObject {
	[k: string]: any;
}

export type Serialize2QueryString = (obj: any) => string;

interface APIMetaInfoWithURL<T extends string, M> {
	url: string;
	method?: HTTPMethod;
	// type应当由APIzClient提供, 这里暂定string
	type?: T;
	pathParams?: boolean;
	// meta的类型也应当由APIzClient提供, 这里暂定any
	meta?: M;
}

interface APIMetaInfoWithPath<T extends string, M> {
	baseURL?: string;
	path: string;
	method?: HTTPMethod;
	// type应当由APIzClient提供, 这里暂定string
	type?: T;
	pathParams?: boolean;
	// meta的类型也应当由APIzClient提供, 这里暂定any
	meta?: M;
}

export type APIMetaInfo<T extends string, M> = APIMetaInfoWithURL<T, M> | APIMetaInfoWithPath<T, M>;

interface APIMetaWithoutBaseURL<T extends string, M> {
	[key: string]: APIMetaInfo<T, M>;
}

interface APIMetaWithBaseURL {
	_baseURL?: string;
}

// 为什么不把这两个放一个接口, 放一个接口的话, 索引类型还需要联合undefined和string
// 然而对于APIMetaInfo, 是不允许undefined和string, 所以拆两个接口用&
export type APIMeta<T extends string, M> = APIMetaWithBaseURL & Omit<APIMetaWithoutBaseURL<T, M>, '_baseURL'>;

export interface ClientRequestOptions<T extends string, M, O> {
	url: string;
	name: string;
	meta?: M;
	options?: O;
	type?: T;
	body?: any;
}

export type APIzClient<T extends string, M, O, H extends HTTPMethodLowerCase> = {
	[K in H]?: (options: ClientRequestOptions<T, M, O>) => Promise<any>;
}

export interface GlobalOptions<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>> {
	client?: C;
	paramRegex?: RegExp;
	defaultType?: string;
	immutableMeta?: boolean;
	reset?: boolean;
	querystring?(obj: object): string;
}

export interface APIzOptions<C> {
	baseURL?: string;
	client?: C;
	immutableMeta?: boolean;
	paramRegex?: RegExp;
	querystring?: Serialize2QueryString;
}

interface ParsedAPIMetaInfo<T extends string, M, O> extends APIzClient<T, M, O, HTTPMethodLowerCase> {
	url: string;
	baseURL: string;
	path: string;
	name: string;
	meta?: M;
	method: HTTPMethodUpperCase;
	methodLowerCase: HTTPMethodLowerCase;
	type: T;
	pathParams: boolean;
	regex: RegExp;
	querystring: Serialize2QueryString;
	init: boolean;
};

export interface APIzRequest<T, M, O> {
	// with body
	(body: any, params: KVObject, query: KVObject | string, type: T): Promise<any>;
	(body?: any, params?: KVObject, query?: KVObject | string): Promise<any>;
	(body: any, params: KVObject | string, type: T): Promise<any>;
	// (body: any, params: KVObject): Promise<any>;
	// (body: any, query: KVObject | string, type: T): Promise<any>;
	(body: any, query: KVObject | string): Promise<any>;
	(body: any, type: T): Promise<any>;
	// (body: any): Promise<any>;
	// without body
	(params: KVObject, query?: KVObject | string): Promise<any>;
	// (params: KVObject): Promise<any>;
	(query: KVObject | string): Promise<any>;
	// (): Promise<any>;
	(clientOptions: O, optionsFlag: boolean): Promise<any>;
	readonly url: string;
	readonly method: HTTPMethodUpperCase;
	readonly meta: M;
	readonly type: T;
	readonly pathParams: boolean;
}


type ProxyMeta<T extends string, M, O, N extends APIMeta<T, M>> = {
	[K in keyof N]: APIzRequest<T, M, O>;
}

interface APIzMethod<T extends string, M> {
	add: (name: string, apiInfo: APIMetaInfo<T, M>) => this;
	remove: (name: string) => this;
}

export type APIzInstance<T extends string, M, O, N extends APIMeta<T, M>> =  APIzMethod<T, M> & Omit<ProxyMeta<T, M, O, N>, 'add' | 'remove'>;


const toString = (Map as unknown as () => any).call.bind(Object.prototype.toString);
const isObj = (o: any) => toString(o) === '[object Object]';
const isFn = (f: any): f is Callable => typeof f === 'function';
const isStr = (s: any): s is string => s && typeof s === 'string';
const isEnumerable = (Map as unknown as () => any).call.bind(Object.prototype.propertyIsEnumerable);

let defaultType: string | undefined,
	globalQuerystring: Serialize2QueryString | undefined,
	globalParamRegex: RegExp | undefined,
	// 这东西有没有, 是什么类型, 应该只能在运行时才能确定了, 或者分析控制流?
	// 那就随便写个类型吧...等到使用处as一下好了
	globalClient: APIzClient<any, any, any, HTTPMethodLowerCase> | undefined,
	globalImmutableMeta: boolean | undefined = false;

// ES2018+, 是讲这个特性没法被babel转译,
// 那既然都用ES2018了, 不如把能用的特性都用上好了...
const defaultParamRegex = /(?<=\/):((\w|-)+)/g,
	slashRegex = /(?<!:)(\/\/)/g,
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
	};


function parseApiInfo<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>>(
	name: string,
	rawInfo: UnionToIntersection<APIMetaInfo<T, M>>,
	{ baseURL: gBaseURL, paramRegex, querystring, client }: {
		baseURL?: string;
		paramRegex: RegExp;
		querystring: Serialize2QueryString;
		client: C
	}
): ParsedAPIMetaInfo<T, M, O> | never {
	// tslint:disable-next-line
	let { url, baseURL, path, meta, method = 'GET' as HTTPMethodUpperCase, type = defaultType as T, pathParams = false } = rawInfo;
	const info = {} as ParsedAPIMetaInfo<T, M, O>,
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
		info.url = (bURL + (path || '')).replace(slashRegex, '/');
	} else {
		throw new Error(`API "${name}" must set url or baseURL correctly.`);
	}
	method = method.toUpperCase() as HTTPMethodUpperCase;
	const methodLowerCase = method.toLowerCase() as HTTPMethodLowerCase;
	if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
		throw new Error(`Unsupported HTTP method: ${method}.`);
	}
	if (!isFn((client as any)[methodLowerCase])) {
		throw new Error(`client must implement a ${methodLowerCase} function.`);
	}
	info.name = name;
	info.meta = meta;
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

function replaceParams(params: KVObject): (m: string, v: string) => string | never {
	return (m: string, v: string) => {
		if (params[v] == null) {
			throw new Error(`Can't find a property "${v}" in params.`);
		}
		return encodeURIComponent(params[v]);
	};
}


// 其实noBodyRequest和bodyRequest我们可以合并成一个,
// 因为我们已经知道method了, 也就可以知道它是否会带body,
// 但是考虑到让代码更加清晰一点, 还是拆成两个吧, 这点
// 代码重复算是可以接受. 另一方面讲, 其实也可以让接口只
// 实现一个request方法就好, 而不用对每个HTTP方法都实现一个
// 对应的方法, 因为我们也可以把method传过去
function noBodyRequest<T extends string, M, O>(this: ParsedAPIMetaInfo<T, M, O>, ...args: Array<any>): Promise<any> | never {
	const { methodLowerCase, pathParams, regex, querystring } = this;
	let params, query, qs, url = this.url;
	if (args[1] === true) {
		// 接口处记得检测对象是否为空
		return this[methodLowerCase]!({
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
		url = url.replace(regex, replaceParams(params));
	} else if (pathParams) {
		throw new Error('Path params is required.');
	}

	if (query) {
		qs = querystring(query);
		url = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
	}
	return this[methodLowerCase]!({
		url,
		name: this.name,
		meta: this.meta
	});
}

function bodyRequest<T extends string, M, O>(this: ParsedAPIMetaInfo<T, M, O>, ...args: Array<any>): Promise<any> | never {
	// $以区分全局变量
	const { methodLowerCase, type: $defaultType, pathParams, regex, querystring } = this;
	let params, query, body, type, qs, url = this.url;
	if (args[1] === true) {
		return this[methodLowerCase]!({
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
		url = url.replace(regex, replaceParams(params));
	} else if (pathParams) {
		throw new Error('Path params is required.');
	}

	// 这里实际上会造成带body的query的集合和不带body的query的集合不一致,
	// 不过考虑实际情况这样的不一致也是可以接受
	if (isStr(query) && !query.includes('=')) {
		type = query;
	} else if (query) {
		qs = querystring(query);
		url = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
	}
	return this[methodLowerCase]!({
		url,
		type,
		body,
		name: this.name,
		meta: this.meta
	});
}

function createAPI<T extends string, M, O>(info: ParsedAPIMetaInfo<T, M, O>): APIzRequest<T, M, O> | never {
	// const fn = methodMap[info.method]
	const f = (methodMap as unknown as ParsedAPIMetaInfo<T, M, O>)[info.methodLowerCase];
	if (!f) {
		throw new Error(`APIzClient must implement ${info.methodLowerCase} method.`);
	}
	const fn = f.bind(info);

	['url', 'method', 'meta', 'type', 'pathParams'].forEach(k => {
		Object.defineProperty(fn, k, {
			value: (info as any)[k],
			enumerable: true,
			writable: false
		});
	});
	return fn as APIzRequest<T, M, O>;
}




// 理想情况下是这样的
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
function APIz<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>, N extends APIMeta<T, M>>(apiMeta: N, options?: APIzOptions<C>): APIzInstance<T, M, O, N> | never {
	let baseURL: string | undefined,
		immutableMeta: boolean,
		paramRegex: RegExp,
		querystring: Serialize2QueryString,
		client: C,
		meta = {} as APIMeta<T, M>;

	isStr(apiMeta._baseURL) && (baseURL = apiMeta._baseURL);

	({
		baseURL = baseURL,
		// 这里undefined没什么影响, 视为boolean没问题
		immutableMeta = globalImmutableMeta as boolean,
		paramRegex = globalParamRegex || defaultParamRegex,
		// 这里querystring虽然可能为undefined, 但是后面立马检测了是否为callable,
		// 为了给js用户提示, 所以这里也可以暂时视为不为undefined
		querystring = globalQuerystring as Serialize2QueryString,
		client = globalClient as C
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
				meta[key] = parseApiInfo<T, M, O, C>(key, apiMeta[key as keyof APIMeta<T, M>] as UnionToIntersection<APIMetaInfo<T, M>>, groupOptions);
			} else if (key !== '_baseURL') {
				console.warn(`The ${key} in meta is not an object.`);
			}
		}
	}

	const pxy = new Proxy({}, {
		get(target, key, receiver) {
			if (!meta[key as string] || !isEnumerable(meta, key)) {
				return Reflect.get(target, key);
			} else if (!(meta[key as string] as ParsedAPIMetaInfo<T, M, O>).init) {
				meta[key as string] = parseApiInfo<T, M, O, C>(key as string, meta[key as string] as UnionToIntersection<APIMetaInfo<T, M>>, groupOptions);
			}
			// 到这里有个meta[key]在运行时从APIMetaInfo到ParsedAPIMetaInfo的类型转换
			// 只能是强行as了
			const apiFn = createAPI(meta[key as string] as ParsedAPIMetaInfo<T, M, O>);
			Reflect.set(receiver, key, apiFn);
			return apiFn;
		},
		getPrototypeOf() {
			return APIz.prototype;
		}
	});

	const self = Object.create(pxy) as APIzInstance<T, M, O, N>;
	self.remove = function (name: string): APIzInstance<T, M, O, N> {
		this[name] && ((meta[name] as any) = (this[name] as any) = undefined);
		return this;
	};
	self.add = function (name: string, apiInfo: APIMetaInfo<T, M>): APIzInstance<T, M, O, N> {
		if (meta[name]) {
			throw new Error(`API "${name}" already exists.`);
		}
		meta[name] = parseApiInfo<T, M, O, C>(name, apiInfo as UnionToIntersection<APIMetaInfo<T, M>>, groupOptions);
		// 同前面一样存在运行时类型转换
		this[name] = createAPI(meta[name] as ParsedAPIMetaInfo<T, M, O>);
		return this;
	};
	return self;
}

export { APIz };

export function config<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>>(
	{
		querystring, paramRegex, immutableMeta, client, reset, defaultType: dt
	}: GlobalOptions<T, M, O, C> = { reset: true }
	) {
	isFn(querystring) && (globalQuerystring = querystring);
	paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
	globalImmutableMeta = immutableMeta;
	globalClient = client;
	defaultType = dt;
	reset && (globalQuerystring = globalParamRegex = globalClient = defaultType = undefined, globalImmutableMeta = false);
}
