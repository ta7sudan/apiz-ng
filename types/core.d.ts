export declare type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
export declare type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;
interface APIInfoWithURL<ContentType, Meta> {
    url: string;
    method?: HTTPMethod;
    type?: ContentType;
    meta?: Meta;
}
interface APIInfoWithPath<ContentType, Meta> {
    baseURL?: string;
    path: string;
    method?: HTTPMethod;
    type?: ContentType;
    meta?: Meta;
}
export declare type APIInfo<ContentType = any, Meta = any> = APIInfoWithURL<ContentType, Meta> | APIInfoWithPath<ContentType, Meta>;
export interface APIGroup<T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>> {
    baseURL?: string;
    apis: T;
}
export interface ClientRequestOptions<RawRequestOptions, ContentType, Meta> {
    url: string;
    name: string;
    meta?: Meta;
    options?: RawRequestOptions;
    body?: any;
    params?: Record<string, string>;
    query?: string | Record<string, any>;
    headers?: Record<string, any>;
    type?: ContentType;
    handleError?: boolean;
}
export declare type APIzClientRequest<RawRequestOptions, ContentType, Meta> = (options: ClientRequestOptions<RawRequestOptions, ContentType, Meta>) => Promise<any>;
export declare type APIzClient<RawRequestOptions, ContentType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = {
    [k in Method]: APIzClientRequest<RawRequestOptions, ContentType, Meta>;
};
export declare type Serialize2QueryString = (obj: any) => string;
export interface APIzOptions<RawRequestOptions, ContentType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
    baseURL?: string;
    client?: APIzClient<RawRequestOptions, ContentType, Meta, Method>;
    immutable?: boolean;
    paramRegex?: RegExp;
    querystring?: Serialize2QueryString;
}
export interface GlobalAPIzOptions<RawRequestOptions, ContentType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
    client?: APIzClient<RawRequestOptions, ContentType, Meta, Method>;
    paramRegex?: RegExp;
    defaultType?: ContentType;
    immutable?: boolean;
    reset?: boolean;
    querystring?: (obj: any) => string;
}
declare type ContentTypeFrom<R> = R extends Record<string, APIInfo<infer C, infer M>> ? C extends unknown ? any : C : never;
declare type ProxyGroup<RawRequestOptions, T extends Record<string, APIInfo<any, any>>> = {
    [k in keyof T]: RequestWithoutThis<RawRequestOptions, ContentTypeFrom<T>>;
};
export declare type APIzInstance<RawRequestOptions = any, T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = Omit<ProxyGroup<RawRequestOptions, T>, 'remove' | 'add'> & {
    remove: (name: string) => APIzInstance<RawRequestOptions, T, Method>;
    add: (name: string, apiInfo: T extends Record<string, infer I> ? I extends APIInfo<infer C, infer M> ? APIInfo<C extends unknown ? any : C, M extends unknown ? any : M> : never : never) => APIzInstance<RawRequestOptions, T, Method>;
};
export interface APIzRequestOptions<ContentType> {
    body?: any;
    params?: Record<string, string>;
    query?: string | Record<string, any>;
    headers?: Record<string, any>;
    type?: ContentType;
    handleError?: boolean;
}
export declare type RequestWithoutThis<RawRequestOptions, ContentType> = (options?: APIzRequestOptions<ContentType> | RawRequestOptions, isRawOption?: boolean) => Promise<any>;
export interface APIzRequest<RawRequestOptions, ContentType, Meta> {
    (options: APIzRequestOptions<ContentType> | RawRequestOptions, isRawOption?: boolean): Promise<any>;
    readonly url: string;
    readonly method: HTTPMethodUpperCase;
    readonly meta: Meta;
    readonly type: ContentType;
}
export declare function APIz<RawRequestOptions = any, ContentType = any, Meta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase, T extends Record<string, APIInfo<ContentType, Meta>> = Record<string, APIInfo<ContentType, Meta>>>(group: APIGroup<T>, options?: APIzOptions<RawRequestOptions, ContentType, Meta, Method>): APIzInstance<RawRequestOptions, T, Method>;
export declare function config<RawRequestOptions, ContentType = any, Meta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>({ querystring, paramRegex, immutable, client, reset, defaultType: dt }?: GlobalAPIzOptions<RawRequestOptions, ContentType, Meta, Method>): void;
export {};
//# sourceMappingURL=core.d.ts.map