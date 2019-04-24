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

interface APIMetaInfoWithURL<APIzClientType = any, APIzClientMeta = any> {
	url: string;
	method?: HTTPMethod;
	// type应当由APIzClient提供, 这里暂定string
	type?: APIzClientType;
	pathParams?: boolean;
	// meta的类型也应当由APIzClient提供, 这里暂定any
	meta?: APIzClientMeta;
}

interface APIMetaInfoWithPath<APIzClientType = any, APIzClientMeta = any> {
	baseURL?: string;
	path: string;
	method?: HTTPMethod;
	// type应当由APIzClient提供, 这里暂定string
	type?: APIzClientType;
	pathParams?: boolean;
	// meta的类型也应当由APIzClient提供, 这里暂定any
	meta?: APIzClientMeta;
}

export type APIMetaInfo<APIzClientType = any, APIzClientMeta = any> = APIMetaInfoWithURL<APIzClientType, APIzClientMeta> | APIMetaInfoWithPath<APIzClientType, APIzClientMeta>;

interface APIMetaWithoutBaseURL<APIzClientType = any, APIzClientMeta = any> {
	[key: string]: APIMetaInfo<APIzClientType, APIzClientMeta>;
}

interface APIMetaWithBaseURL {
	_baseURL?: string;
}

// 为什么不把这两个放一个接口, 放一个接口的话, 索引类型还需要联合undefined和string
// 然而对于APIMetaInfo, 是不允许undefined和string, 所以拆两个接口用&
export type APIMeta<APIzClientType = any, APIzClientMeta = any> = APIMetaWithBaseURL & Omit<APIMetaWithoutBaseURL<APIzClientType, APIzClientMeta>, '_baseURL'>;

export interface ClientRequestOptions<RawRequestOptions, APIzClientType = any, APIzClientMeta = any> {
	url: string;
	name: string;
	meta?: APIzClientMeta;
	options?: RawRequestOptions;
	type?: APIzClientType;
	body?: any;
}

export type APIzClient<RawRequestOptions, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = {
	[K in Method]?: (options: ClientRequestOptions<RawRequestOptions, APIzClientType, APIzClientMeta>) => Promise<any>;
}

export interface GlobalOptions<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
	client?: Client;
	paramRegex?: RegExp;
	defaultType?: any;
	immutableMeta?: boolean;
	reset?: boolean;
	querystring?(obj: object): string;
}

export interface APIzOptions<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
	baseURL?: string;
	client?: Client;
	immutableMeta?: boolean;
	paramRegex?: RegExp;
	querystring?: Serialize2QueryString;
}

// emmm...这里比较尴尬, 照理来说应该是下面这样, 但是这样Method不是确定的, extends需要继承一个确定的类型
// interface ParsedAPIMetaInfo<RawRequestOptions, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method> {
interface ParsedAPIMetaInfo<RawRequestOptions, APIzClientType = any, APIzClientMeta = any> extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta> {
	url: string;
	baseURL: string;
	path: string;
	name: string;
	meta?: APIzClientMeta;
	method: HTTPMethodUpperCase;
	methodLowerCase: HTTPMethodLowerCase;
	type: APIzClientType;
	pathParams: boolean;
	regex: RegExp;
	querystring: Serialize2QueryString;
	init: boolean;
};

export interface APIzRequest<RawRequestOptions, APIzClientType = any, APIzClientMeta = any> {
	// with body
	(body?: any, params?: KVObject, query?: KVObject | string, type?: APIzClientType): Promise<any>;
	// (body?: any, params?: KVObject, query?: KVObject | string): Promise<any>;
	(body: any, params: KVObject | string, type?: APIzClientType): Promise<any>;
	// (body: any, params: KVObject): Promise<any>;
	// (body: any, query: KVObject | string, type: T): Promise<any>;
	// (body: any, query: KVObject | string): Promise<any>;
	(body: any, type: APIzClientType): Promise<any>;
	// (body: any): Promise<any>;
	// without body
	(params: KVObject, query?: KVObject | string): Promise<any>;
	// (params: KVObject): Promise<any>;
	(query: KVObject | string): Promise<any>;
	// (): Promise<any>;
	(rawRequestOptions: RawRequestOptions, optionsFlag: boolean): Promise<any>;
	readonly url: string;
	readonly method: HTTPMethodUpperCase;
	readonly meta: APIzClientMeta;
	readonly type: APIzClientType;
	readonly pathParams: boolean;
}


type ProxyMeta<RawRequestOptions, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any> = {
	[K in keyof Meta]: APIzRequest<RawRequestOptions, APIzClientType, APIzClientMeta>;
}

interface APIzMethod<APIzClientType = any, APIzClientMeta = any> {
	add: (name: string, apiInfo: APIMetaInfo<APIzClientType, APIzClientMeta>) => this;
	remove: (name: string) => this;
}

export type APIzInstance<RawRequestOptions, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any> =  APIzMethod<APIzClientType, APIzClientMeta> & Omit<ProxyMeta<RawRequestOptions, Meta, APIzClientType, APIzClientMeta>, 'add' | 'remove'>;


const toString = (Map as unknown as () => any).call.bind(Object.prototype.toString);
const isObj = (o: any): boolean => toString(o) === '[object Object]';
const isFn = (f: any): f is Callable => typeof f === 'function';
const isStr = (s: any): s is string => s && typeof s === 'string';
const isEnumerable = (Map as unknown as () => any).call.bind(Object.prototype.propertyIsEnumerable);

let defaultType: any,
	globalQuerystring: Serialize2QueryString | undefined,
	globalParamRegex: RegExp | undefined,
	// 这东西有没有, 是什么类型, 应该只能在运行时才能确定了, 或者分析控制流?
	// 那就随便写个类型吧...等到使用处as一下好了
	globalClient: APIzClient<any, any, any, HTTPMethodLowerCase> | undefined,
	globalImmutableMeta: boolean | undefined = false;

// ES2018+, 是讲这个特性没法被babel转译,
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
	replaceSlash = (m: string, o: number): string => o <= 6 ? m : '/';


function parseApiInfo<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>(
	name: string,
	rawInfo: UnionToIntersection<APIMetaInfo<APIzClientType, APIzClientMeta>>,
	{ baseURL: gBaseURL, paramRegex, querystring, client }: {
		baseURL?: string;
		paramRegex: RegExp;
		querystring: Serialize2QueryString;
		client: Client;
	}
): ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta> | never {
	// tslint:disable-next-line
	let { url, baseURL, path, meta, method = 'GET' as HTTPMethodUpperCase, type = defaultType as APIzClientType, pathParams = false } = rawInfo;
	const info = {} as ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>,
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
	method = method.toUpperCase() as HTTPMethodUpperCase;
	const methodLowerCase = method.toLowerCase() as HTTPMethodLowerCase;
	if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) {
		throw new Error(`Unsupported HTTP method: ${method}.`);
	}
	if (!isFn((client as any)[methodLowerCase])) {
		throw new Error(`client must implement a ${methodLowerCase} function.`);
	}
	const parts = info.url.split(/\/(?=\w|:)/g), offset = /^(https?:|\/)/.test(parts[0]) ? 2 : 1;
	info.baseURL = parts.slice(0, offset).join('/');
	info.path = `/${parts.slice(offset).join('/')}`;
	info.name = name;
	info.meta = meta;
	info.method = method;
	info.methodLowerCase = methodLowerCase;
	// 前面已经确保了client实现了该method
	info[methodLowerCase] = (client as any)[methodLowerCase];
	info.type = type;
	info.pathParams = pathParams;
	info.regex = paramRegex;
	info.querystring = querystring;
	info.init = true;
	return info;
}

function replaceParams(params: KVObject): (m: string, v: string) => string | never {
	return (m: string, v: string): string | never => {
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
function noBodyRequest<RawRequestOptions, APIzClientType = any, APIzClientMeta = any>(this: ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>, ...args: Array<any>): Promise<any> | never {
	const { methodLowerCase, pathParams, regex, querystring, baseURL, path } = this;
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
		url = baseURL + path.replace(regex, replaceParams(params));
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

function bodyRequest<RawRequestOptions, APIzClientType = any, APIzClientMeta = any>(this: ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>, ...args: Array<any>): Promise<any> | never {
	// $以区分全局变量
	const { methodLowerCase, type: $defaultType, pathParams, regex, querystring, baseURL, path } = this;
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
		url = baseURL + path.replace(regex, replaceParams(params));
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

function createAPI<RawRequestOptions, APIzClientType = any, APIzClientMeta = any>(info: ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>): APIzRequest<RawRequestOptions, APIzClientType, APIzClientMeta> | never {
	// const fn = methodMap[info.method]
	const f = (methodMap as unknown as ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>)[info.methodLowerCase];
	// 因为在parseApiInfo的时候已经判断过了, 所以这里不需要判断了, 可以确定f不为空
	// 但是如果哪天重构把前面的判断去掉了, 这里记得加回来
	// if (!f) {
	// 	throw new Error(`APIzClient must implement ${info.methodLowerCase} method.`);
	// }
	const fn = f!.bind(info);

	['url', 'method', 'meta', 'type', 'pathParams'].forEach((k: string) => {
		Object.defineProperty(fn, k, {
			value: (info as any)[k],
			enumerable: true,
			writable: false
		});
	});
	return fn as APIzRequest<RawRequestOptions, APIzClientType, APIzClientMeta>;
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
function APIz<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>(apiMeta: Meta, options?: APIzOptions<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>): APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta> | never {
	let baseURL: string | undefined,
		immutableMeta: boolean,
		paramRegex: RegExp,
		querystring: Serialize2QueryString,
		client: Client,
		meta = {} as APIMeta<APIzClientType, APIzClientMeta>;

	isStr(apiMeta._baseURL) && (baseURL = apiMeta._baseURL);

	({
		baseURL = baseURL,
		// 这里undefined没什么影响, 视为boolean没问题
		immutableMeta = globalImmutableMeta as boolean,
		paramRegex = globalParamRegex || defaultParamRegex,
		// 这里querystring虽然可能为undefined, 但是后面立马检测了是否为callable,
		// 为了给js用户提示, 所以这里也可以暂时视为不为undefined
		querystring = globalQuerystring as Serialize2QueryString,
		client = globalClient as Client
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
				meta[key] = parseApiInfo<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>(key, apiMeta[key as keyof APIMeta<APIzClientType, APIzClientMeta>] as UnionToIntersection<APIMetaInfo<APIzClientType, APIzClientMeta>>, groupOptions);
			} else if (key !== '_baseURL') {
				console.warn(`The ${key} in meta is not an object.`);
			}
		}
	}

	const pxy = new Proxy({}, {
		get(target: object, key: string | symbol, receiver: APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta>): any {
			if (!meta[key as string] || !isEnumerable(meta, key)) {
				return Reflect.get(target, key);
			} else if (!(meta[key as string] as ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>).init) {
				meta[key as string] = parseApiInfo<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>(key as string, meta[key as string] as UnionToIntersection<APIMetaInfo<APIzClientType, APIzClientMeta>>, groupOptions);
			}
			// 到这里有个meta[key]在运行时从APIMetaInfo到ParsedAPIMetaInfo的类型转换
			// 只能是强行as了
			const apiFn = createAPI(meta[key as string] as ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>);
			Reflect.set(receiver, key, apiFn);
			return apiFn;
		},
		getPrototypeOf(): object {
			return APIz.prototype;
		}
	});

	const self = Object.create(pxy) as APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta>;
	self.remove = function (name: string): APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta> {
		this[name] && ((meta[name] as any) = (this[name] as any) = undefined);
		return this;
	};
	self.add = function (name: string, apiInfo: APIMetaInfo<APIzClientType, APIzClientMeta>): APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta> {
		if (meta[name]) {
			throw new Error(`API "${name}" already exists.`);
		}
		meta[name] = parseApiInfo<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>(name, apiInfo as UnionToIntersection<APIMetaInfo<APIzClientType, APIzClientMeta>>, groupOptions);
		// 同前面一样存在运行时类型转换
		this[name] = createAPI(meta[name] as ParsedAPIMetaInfo<RawRequestOptions, APIzClientType, APIzClientMeta>);
		return this;
	};
	return self;
}

export { APIz };

export function config<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>(
	{
		querystring, paramRegex, immutableMeta, client, reset, defaultType: dt
	}: GlobalOptions<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method> = { reset: true }
): void {
	isFn(querystring) && (globalQuerystring = querystring);
	paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
	globalImmutableMeta = immutableMeta;
	globalClient = client;
	defaultType = dt;
	reset && (globalQuerystring = globalParamRegex = globalClient = defaultType = undefined, globalImmutableMeta = false);
}
