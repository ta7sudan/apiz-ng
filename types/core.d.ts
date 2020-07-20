export declare type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
export declare type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;
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
export declare type APIInfo<ContentType = any, ResponseType = any, Meta = any> = APIInfoWithURL<ContentType, ResponseType, Meta> | APIInfoWithPath<ContentType, ResponseType, Meta>;
export interface APIGroup<T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>> {
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
export declare type APIzClientRequest<RawRequestOptions, ContentType, ResponseType, Meta> = (options: ClientRequestOptions<RawRequestOptions, ContentType, ResponseType, Meta>) => Promise<any>;
export declare type APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = {
    [k in Method]: APIzClientRequest<RawRequestOptions, ContentType, ResponseType, Meta>;
};
export declare type Serialize2QueryString = (obj: any) => string;
export interface APIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
    baseURL?: string;
    client?: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
    immutable?: boolean;
    paramRegex?: RegExp;
    querystring?: Serialize2QueryString;
}
export interface GlobalAPIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> {
    client?: APIzClient<RawRequestOptions, ContentType, ResponseType, Meta, Method>;
    paramRegex?: RegExp;
    defaultContentType?: ContentType;
    defaultResponseType?: ResponseType;
    immutable?: boolean;
    reset?: boolean;
    querystring?: (obj: any) => string;
}
declare type ContentTypeFrom<R> = R extends Record<string, APIInfo<infer C, infer M>> ? C extends unknown ? any : C : never;
declare type ResponseTypeFrom<R> = R extends Record<string, APIInfo<infer C, infer M>> ? M extends unknown ? any : M : never;
declare type ProxyGroup<RawRequestOptions, T extends Record<string, APIInfo<any, any>>> = {
    [k in keyof T]: RequestWithoutThis<RawRequestOptions, ContentTypeFrom<T>, ResponseTypeFrom<T>>;
};
export declare type APIzInstance<RawRequestOptions = any, T extends Record<string, APIInfo<any, any>> = Record<string, APIInfo<any, any>>, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase> = Omit<ProxyGroup<RawRequestOptions, T>, 'remove' | 'add'> & {
    remove: (name: string) => APIzInstance<RawRequestOptions, T, Method>;
    add: (name: string, apiInfo: T extends Record<string, infer I> ? I extends APIInfo<infer C, infer M> ? APIInfo<C extends unknown ? any : C, M extends unknown ? any : M> : never : never) => APIzInstance<RawRequestOptions, T, Method>;
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
export declare type RequestWithoutThis<RawRequestOptions, ContentType, ResponseType> = (options?: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions, isRawOption?: boolean) => Promise<any>;
export interface APIzRequest<RawRequestOptions, ContentType, ResponseType, Meta> {
    (options: APIzRequestOptions<ContentType, ResponseType> | RawRequestOptions, isRawOption?: boolean): Promise<any>;
    readonly url: string;
    readonly method: HTTPMethodUpperCase;
    readonly meta: Meta;
    readonly contentType: ContentType;
    readonly responseType: ResponseType;
}
export declare function APIz<RawRequestOptions = any, ContentType = any, ResponseType = any, Meta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase, T extends Record<string, APIInfo<ContentType, ResponseType, Meta>> = Record<string, APIInfo<ContentType, ResponseType, Meta>>>(group: APIGroup<T>, options?: APIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method>): APIzInstance<RawRequestOptions, T, Method>;
export declare function config<RawRequestOptions, ContentType = any, ResponseType = any, Meta = any, Method extends HTTPMethodLowerCase = HTTPMethodLowerCase>({ querystring, paramRegex, immutable, client, reset, defaultContentType: dct, defaultResponseType: drt }?: GlobalAPIzOptions<RawRequestOptions, ContentType, ResponseType, Meta, Method>): void;
export {};
//# sourceMappingURL=core.d.ts.map