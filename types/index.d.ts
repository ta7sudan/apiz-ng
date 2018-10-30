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

interface APIzClient {
	get?(url: string, options?: object): Promise<any>;
	head?(url: string, options?: object): Promise<any>;
	delete?(url: string, options?: object): Promise<any>;
	options?(url: string, options?: object): Promise<any>;
	post?(url: string, bodyOrOptions: any, type: string, isOptions: boolean): Promise<any>;
	put?(url: string, bodyOrOptions: any, type: string, isOptions: boolean): Promise<any>;
	patch?(url: string, bodyOrOptions: any, type: string, isOptions: boolean): Promise<any>;
}

interface APIzNoBodyRequest {
	(params?: object, query?: string | object): Promise<any>;
}

interface APIzBodyRequest {
	(body: any, params?: object, query?: string | object, type?: string): Promise<any>;
}

interface APIzRawOptionsRequest {
	(options: object, flag: boolean): Promise<any>;
}


export class APIz {
	constructor(apiMeta?: APIMeta, groupOptions?: GroupOptions);
	add(key: string, info: APIInfo): void;
	remove(key: string): void;
	[key: string]: function | APIzBodyRequest | APIzNoBodyRequest | APIzRawOptionsRequest;
}

export function config(options?: GlobalOptions): void;
