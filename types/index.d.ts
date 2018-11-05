interface APIMeta {
	_baseURL?: string;
	[key: string]: APIInfo | string;
}

interface APIInfo {
	url?: string;
	baseURL?: string;
	path?: string;
	method?: string;
	type?: string;
	pathParams?: boolean;
	meta?: object;
}

interface GroupOptions {
	baseURL?: string;
	client?: APIzClient;
	immutableMeta?: boolean;
	paramRegex?: RegExp;
	querystring?(obj: object): string;
}

interface GlobalOptions {
	client?: APIzClient;
	paramRegex?: RegExp;
	defaultType?: string;
	immutableMeta?: boolean;
	querystring?(obj: object): string;
}

interface NoBodyOptions {
	url: string;
	name: string;
	meta: any;
	options?: object;
}

interface BodyOptions {
	url: string;
	type: string;
	name: string;
	meta: any;
	body: any;
	options: object;
}


interface APIzClient {
	get?(options: NoBodyOptions): Promise<any>;
	head?(options: NoBodyOptions): Promise<any>;
	delete?(options: NoBodyOptions): Promise<any>;
	options?(options: NoBodyOptions): Promise<any>;
	post?(options: BodyOptions): Promise<any>;
	put?(options: BodyOptions): Promise<any>;
	patch?(options: BodyOptions): Promise<any>;
}

interface APIzNoBodyRequest extends APIzRawOptionsRequest {
	(params?: object, query?: string | object): Promise<any>;
}

interface APIzBodyRequest extends APIzRawOptionsRequest {
	(body: any, params?: object, query?: string | object, type?: string): Promise<any>;
}

interface APIzRawOptionsRequest {
	(options: object, flag: boolean): Promise<any>;
	url: string;
	method: string;
	type: string;
	pathParams: boolean;
	meta: any;
}


export class APIz {
	constructor(apiMeta?: APIMeta, groupOptions?: GroupOptions);
	add(key: string, info: APIInfo): void;
	remove(key: string): void;
	[key: string]: function | APIzBodyRequest | APIzNoBodyRequest;
}

export function config(options?: GlobalOptions): void;
