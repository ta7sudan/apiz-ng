import { Omit } from 'type-fest';
export declare type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
declare type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;
interface KVObject {
    [k: string]: any;
}
export declare type Serialize2QueryString = (obj: any) => string;
interface APIMetaInfoWithURL<APIzClientType = any, APIzClientMeta = any> {
    url: string;
    method?: HTTPMethod;
    type?: APIzClientType;
    pathParams?: boolean;
    meta?: APIzClientMeta;
}
interface APIMetaInfoWithPath<APIzClientType = any, APIzClientMeta = any> {
    baseURL?: string;
    path: string;
    method?: HTTPMethod;
    type?: APIzClientType;
    pathParams?: boolean;
    meta?: APIzClientMeta;
}
export declare type APIMetaInfo<APIzClientType = any, APIzClientMeta = any> = APIMetaInfoWithURL<APIzClientType, APIzClientMeta> | APIMetaInfoWithPath<APIzClientType, APIzClientMeta>;
interface APIMetaWithoutBaseURL<APIzClientType = any, APIzClientMeta = any> {
    [key: string]: APIMetaInfo<APIzClientType, APIzClientMeta>;
}
interface APIMetaWithBaseURL {
    _baseURL?: string;
}
export declare type APIMeta<APIzClientType = any, APIzClientMeta = any> = APIMetaWithBaseURL & Omit<APIMetaWithoutBaseURL<APIzClientType, APIzClientMeta>, '_baseURL'>;
export interface ClientRequestOptions<RawRequestOptions, APIzClientType = any, APIzClientMeta = any> {
    url: string;
    name: string;
    meta?: APIzClientMeta;
    options?: RawRequestOptions;
    type?: APIzClientType;
    body?: any;
}
export declare type APIzClient<RawRequestOptions, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = {
    [K in Method]?: (options: ClientRequestOptions<RawRequestOptions, APIzClientType, APIzClientMeta>) => Promise<any>;
};
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
export interface APIzRequest<RawRequestOptions, APIzClientType = any, APIzClientMeta = any> {
    (body?: any, params?: KVObject, query?: KVObject | string, type?: APIzClientType): Promise<any>;
    (body: any, params: KVObject | string, type?: APIzClientType): Promise<any>;
    (body: any, type: APIzClientType): Promise<any>;
    (params: KVObject, query?: KVObject | string): Promise<any>;
    (query: KVObject | string): Promise<any>;
    (rawRequestOptions: RawRequestOptions, optionsFlag: boolean): Promise<any>;
    readonly url: string;
    readonly method: HTTPMethodUpperCase;
    readonly meta: APIzClientMeta;
    readonly type: APIzClientType;
    readonly pathParams: boolean;
}
declare type ProxyMeta<RawRequestOptions, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any> = {
    [K in keyof Meta]: APIzRequest<RawRequestOptions, APIzClientType, APIzClientMeta>;
};
interface APIzMethod<APIzClientType = any, APIzClientMeta = any> {
    add: (name: string, apiInfo: APIMetaInfo<APIzClientType, APIzClientMeta>) => this;
    remove: (name: string) => this;
}
export declare type APIzInstance<RawRequestOptions, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any> = APIzMethod<APIzClientType, APIzClientMeta> & Omit<ProxyMeta<RawRequestOptions, Meta, APIzClientType, APIzClientMeta>, 'add' | 'remove'>;
declare function APIz<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, Meta extends APIMeta<APIzClientType, APIzClientMeta>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>(apiMeta: Meta, options?: APIzOptions<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>): APIzInstance<RawRequestOptions, Meta, APIzClientType, APIzClientMeta> | never;
export { APIz };
export declare function config<RawRequestOptions, Client extends APIzClient<RawRequestOptions, APIzClientType, APIzClientMeta, Method>, APIzClientType = any, APIzClientMeta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>({ querystring, paramRegex, immutableMeta, client, reset, defaultType: dt }?: GlobalOptions<RawRequestOptions, Client, APIzClientType, APIzClientMeta, Method>): void;
//# sourceMappingURL=core.d.ts.map