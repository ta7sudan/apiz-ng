interface APIMeta {
	_baseURL?: string;
	[key: string]: APIInfo;
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
	bodyParser?(obj: object): any;
}

interface GlobalOptions {
	client?: APIzClient;
	paramRegex?: RegExp;
	defaultType?: string;
	immutableMeta?: boolean;
	querystring?(obj: object): string;
	bodyParser?(obj: object): any;
}

interface APIzClient {
	get?(url: string, options?: object): Promise;
	head?(url: string, options?: object): Promise;
	post?(url: string, bodyOrOptions: any, type: string): Promise;
	put?(url: string, bodyOrOptions: any, type: string): Promise;
	patch?(url: string, bodyOrOptions: any, type: string): Promise;
	delete?(url: string, bodyOrOptions: any, type: string): Promise;
	options?(url: string, bodyOrOptions: any, type: string): Promise;
}


export class APIz {
	constructor(apiMeta?: APIMeta, groupOptions?: GroupOptions);
	add(key: string, info: APIInfo): void;
	remove(key: string): void;
}

export function config(options?: GlobalOptions): void;
