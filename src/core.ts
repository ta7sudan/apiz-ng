export type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';

export type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;

interface APIInfoWithURL<ContentType, ResponseType, Meta> {
	url: string;
	method?: HTTPMethod;
	contentType?: ContentType;
	responseType?: ResponseType;
	meta?: Meta;
}

interface APIInfoWithPath<ContentType, ResponseType, Meta> {
	baseURL?: string;
	path: string;
	method?: HTTPMethod;
	contentType?: ContentType;
	responseType?: ResponseType;
	meta?: Meta;
}

export type APIInfo<ContentType = any, ResponseType = any, Meta = any> =
	| APIInfoWithURL<ContentType, ResponseType, Meta>
	| APIInfoWithPath<ContentType, ResponseType, Meta>;

export interface APIGroup<
	T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>
> {
	baseURL?: string;
	apis: T;
}

export interface ClientRequestOptions<RawRequestOptions, ContentType, ResponseType, Meta> {
	url: string;
	name: string;
	meta?: Meta;
	options?: RawRequestOptions;
	body?: any;
	params?: Record<string, string>;
	query?: string | Record<string, any>;
	headers?: Record<string, any>;
	contentType?: ContentType;
	responseType?: ResponseType;
	handleError?: boolean;
}

export type APIzClientRequest<RawRequestOptions, ContentType, ResponseType, Meta> = (
	options: ClientRequestOptions<RawRequestOptions, ContentType, ResponseType, Meta>
) => Promise<any>;

export type APIzClient<
RawRequestOptions,
ContentType,
ResponseType,
Meta,
Method extends HTTPMethodLowerCase = HTTPMethodLowerCase
> = {[k in Method]: APIzClientRequest<RawRequestOptions, ContentType, ResponseType, Meta>};

export type Serialize2QueryString = (obj: any) => string;

export interface APIzOptions<
	RawRequestOptions,
	ContentType,
	ResponseType,
	Meta,
	Method extends HTTPMethodLowerCase = HTTPMethodLowerCase
> {
	baseURL?: string;
	client?: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
	immutable?: boolean;
	paramRegex?: RegExp;
	querystring?: Serialize2QueryString;
}

export interface GlobalAPIzOptions<
	RawRequestOptions,
	ContentType,
	ResponseType,
	Meta,
	Method extends HTTPMethodLowerCase = HTTPMethodLowerCase
> {
	client?: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
	paramRegex?: RegExp;
	defaultContentType?: ContentType;
	defaultResponseType?: ResponseType;
	immutable?: boolean;
	reset?: boolean;
	querystring?: (obj: any) => string;
}

type Callable = (...args: Array<any>) => any;

interface ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase> {
	url: string;
	baseURL: string;
	path: string;
	name: string;
	meta?: Meta;
	method: HTTPMethodUpperCase;
	methodLowerCase: Method;
	contentType?: ContentType;
	responseType?: ResponseType;
	regex: RegExp;
	querystring: Serialize2QueryString;
	init: boolean;
	client: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
}

type ContentTypeFrom<R> = R extends Record<string, APIInfo<infer C, infer M>>
	? C extends unknown
		? any
		: C
	: never;

type ResponseTypeFrom<R> = R extends Record<string, APIInfo<infer C, infer M>>
	? M extends unknown
	? any
	: M
	: never;

type ProxyGroup<RawRequestOptions, T extends Record<string, APIInfo<any, any>>> = {
	[k in keyof T]: RequestWithoutThis<RawRequestOptions, ContentTypeFrom<T>, ResponseTypeFrom<T>>
};

export type APIzInstance<
RawRequestOptions = any,
T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>,
Method extends HTTPMethodLowerCase = HTTPMethodLowerCase
> = Omit<ProxyGroup<RawRequestOptions, T>, 'remove' | 'add'> & {
	remove: (name: string) => APIzInstance<RawRequestOptions, T, Method>;
	add: (
		name: string,
		apiInfo: T extends Record<string, infer I>
		? I extends APIInfo<infer C, infer M>
		? APIInfo<C extends unknown ? any : C, M extends unknown ? any : M>
		: never
		: never
	) => APIzInstance<RawRequestOptions, T, Method>;
};

export interface APIzRequestOptions<ContentType, ResponseType> {
	body?: any;
	params?: Record<string, string>;
	query?: string | Record<string, any>;
	headers?: Record<string, any>;
	contentType?: ContentType;
	responseType?: ResponseType;
	handleError?: boolean;
}

export type RequestWithoutThis<RawRequestOptions, ContentType, ResponseType> = (
	options?: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions,
	isRawOption?: boolean
) => Promise<any>;

type Request<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase> = 
	((
		this: ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>,
		options?: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions,
		isRawOption?: boolean
) => Promise<any>);

export interface APIzRequest<RawRequestOptions, ContentType, ResponseType, Meta> {
	(options: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions, isRawOption?: boolean): Promise<
		any
	>;
	readonly url: string;
	readonly method: HTTPMethodUpperCase;
	readonly meta: Meta;
	readonly contentType: ContentType;
	readonly responseType: ResponseType;
}

const toString = ((Map as unknown) as () => any).call.bind(Object.prototype.toString);
const isStr = (s: any): s is string => s && typeof s === 'string';
const isFn = (f: any): f is Callable => typeof f === 'function';
const isObj = (o: any): boolean => toString(o) === '[object Object]';
const isEnumerable = ((Map as unknown) as () => any).call.bind(
	Object.prototype.propertyIsEnumerable
);

let globalQuerystring: Serialize2QueryString | undefined,
	globalParamRegex: RegExp | undefined,
	globalIsArgsImmutable: boolean | undefined = false,
	globalClient: APIzClient<any, any, any, any, any> | undefined,
	defaultContentType: any,
	defaultResponseType: any;

const defaultParamRegex = /:((\w|-)+)/g,
	slashRegex = /\/\//g,
	replaceSlash = (m: string, o: number): string => (o <= 6 ? m : '/');

function isAPIInfoWithURL<ContentType, ResponseType, Meta>(v: any): v is APIInfoWithURL<ContentType, ResponseType, Meta> {
	return !!v.url;
}

function parseApiInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase>(
	name: string,
	rawInfo: APIInfo<ContentType, ResponseType, Meta>,
	{
		baseURL: gBaseURL,
		paramRegex,
		querystring,
		client
	}: {
	baseURL?: string;
	paramRegex: RegExp;
	querystring: Serialize2QueryString;
	client: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
	}
): ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method> {
	const {
		method = 'GET' as HTTPMethod,
		contentType = defaultContentType as ContentType | undefined,
		responseType = defaultResponseType as ResponseType | undefined,
		meta
	} = rawInfo;
	let url: string | undefined, baseURL: string | undefined, path: string | undefined;

	// 照理讲放parseApiInfo外面显得更合理一点, 不过考虑到add和实例化的时候都要校验
	if (name === 'remove' || name === 'add') {
		throw new Error('"remove" and "add" is preserved key.');
	}

	if (isAPIInfoWithURL<ContentType, ResponseType, Meta>(rawInfo)) {
		url = rawInfo.url;
	} else {
		baseURL = rawInfo.baseURL;
		path = rawInfo.path;
	}

	const info = {} as ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>,
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
	const methodUpperCase = method.toUpperCase() as HTTPMethodUpperCase,
		methodLowerCase = method.toLowerCase() as Method;
	if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(methodUpperCase)) {
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
	info.contentType = contentType;
	info.responseType = responseType;
	info.regex = paramRegex;
	info.querystring = querystring;
	info.init = true;
	return info;
}

function replaceParams(params: Record<string, string>): (m: string, v: string) => string | never {
	return (m: string, v: string): string | never => {
		if (params[v] == null) {
			throw new Error(`Can't find a property "${v}" in params.`);
		}
		return encodeURIComponent(params[v]);
	};
}

function request<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase>(
	this: ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>,
	options?: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions,
	isRawOption?: boolean
): Promise<any> {
	// $以区分全局变量
	const {
		methodLowerCase,
		contentType: $defaultContentType,
		responseType: $defaultResponseType,
		regex,
		querystring,
		baseURL,
		path,
		client,
		meta
	} = this;
	let qs,
		// tslint:disable-next-line
		{query, params, body, headers, contentType, responseType, handleError} = (options as APIzRequestOptions<ContentType, ResponseType> | undefined) || {} as APIzRequestOptions<ContentType, ResponseType>,
		url = this.url;

	if (isRawOption === true) {
		return client[methodLowerCase]({
			url,
			name: this.name,
			handleError,
			options: options as RawRequestOptions | undefined
		});
	}

	// GET, HEAD没有body没有content-type, 如果加上了content-type, 会破坏get默认为简单请求的
	// 行为, 从而导致跨域协商
	// tslint:disable-next-line
	if (contentType == undefined && methodLowerCase !== 'get' && methodLowerCase !== 'head') {
		contentType = $defaultContentType;
	}
	
	// tslint:disable-next-line
	if (responseType == undefined) {
		responseType = $defaultResponseType;
	}

	if (params) {
		url = baseURL + path.replace(regex, replaceParams(params));
	}

	if (query) {
		qs = querystring(query);
		url = url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
	}

	return client[methodLowerCase]({
		url,
		name: this.name,
		handleError,
		meta,
		contentType,
		responseType,
		body,
		headers,
		query
	});
}

function createAPI<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase>(
	info: ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>
): APIzRequest<RawRequestOptions, ContentType, ResponseType, Meta> {
	const fn = request.bind<Request<RawRequestOptions, ContentType, ResponseType, Meta, Method>>(info);

	['url', 'method', 'meta', 'type'].forEach((k: string) => {
		Object.defineProperty(fn, k, {
			value: (info as any)[k],
			enumerable: true,
			writable: false
		});
	});
	return (fn as unknown) as APIzRequest<RawRequestOptions, ContentType, ResponseType, Meta>;
}

export function APIz<
RawRequestOptions = any,
ContentType = any,
ResponseType = any,
Meta = any,
Method extends HTTPMethodLowerCase = HTTPMethodLowerCase,
T extends Record<string, APIInfo<ContentType, ResponseType, Meta>> = Record<string, APIInfo<ContentType, ResponseType, Meta>>
>(
	group: APIGroup<T>,
	options?: APIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method>
): APIzInstance<RawRequestOptions, T, Method> {
	let baseURL: string | undefined,
		immutable: boolean | undefined,
		paramRegex: RegExp,
		querystring: Serialize2QueryString | undefined,
		client: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method> | undefined,
		apiInfoGroup = {} as Record<
			string,
			ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method> | APIInfo<ContentType, ResponseType, Meta>
		>;

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
				apiInfoGroup[key] = parseApiInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>(
					key,
					apis[key],
					groupOptions
				);
			} else {
				console.warn(`The ${key} in meta is not an object.`);
			}
		}
	}

	const pxy = new Proxy(
		{},
		{
			get(target: object, key: string, receiver: APIzInstance<RawRequestOptions, T, Method>): any {
				if (!apiInfoGroup[key] || !isEnumerable(apiInfoGroup, key)) {
					return Reflect.get(target, key);
				} else if (
					!(apiInfoGroup[key] as ParsedAPIInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>).init
				) {
					apiInfoGroup[key] = parseApiInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>(
						key,
						apiInfoGroup[key],
						groupOptions
					);
				}
				const apiFn = createAPI(apiInfoGroup[key] as ParsedAPIInfo<
					RawRequestOptions,
					ContentType,
					ResponseType,
					Meta,
					Method
				>);
				Reflect.set(receiver, key, apiFn);
				return apiFn;
			},
			getPrototypeOf(): object {
				return APIz.prototype;
			}
		}
	);

	const self = Object.create(pxy) as APIzInstance<RawRequestOptions, T, Method>;

	self.remove = function (name: string): APIzInstance<RawRequestOptions, T, Method> {
		this[name] && ((apiInfoGroup[name] as any) = (this[name] as any) = undefined);
		return this;
	};

	self.add = function (
		name: string,
		apiInfo: APIInfo<ContentType, ResponseType, Meta>
	): APIzInstance<RawRequestOptions, T, Method> {
		if (apiInfoGroup[name]) {
			throw new Error(`API "${name}" already exists.`);
		}
		apiInfoGroup[name] = parseApiInfo<RawRequestOptions, ContentType, ResponseType, Meta, Method>(
			name,
			apiInfo,
			groupOptions
		);
		// 同前面一样存在运行时类型转换
		(this as any)[name] = createAPI(apiInfoGroup[name] as ParsedAPIInfo<
			RawRequestOptions,
			ContentType,
			ResponseType,
			Meta,
			Method
		>);
		return this;
	};

	return self;
}

export function config<
RawRequestOptions,
ContentType = any,
ResponseType = any,
Meta = any,
Method extends HTTPMethodLowerCase = HTTPMethodLowerCase
>(
	{
		querystring,
		paramRegex,
		immutable,
		client,
		reset,
		defaultContentType: dct,
		defaultResponseType: drt
	}: GlobalAPIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method> = {reset: true}
): void {
	isFn(querystring) && (globalQuerystring = querystring);
	paramRegex instanceof RegExp && (globalParamRegex = paramRegex);
	globalIsArgsImmutable = immutable;
	globalClient = client;
	defaultContentType = dct;
	defaultResponseType = drt;
	reset &&
		((globalQuerystring = globalParamRegex = globalClient = defaultContentType = defaultResponseType = undefined),
		(globalIsArgsImmutable = false));
}