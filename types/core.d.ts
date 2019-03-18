import { Omit } from 'type-fest';
declare type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
declare type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;
interface KVObject {
    [k: string]: any;
}
export declare type Serialize2QueryString = (obj: any) => string;
interface APIMetaInfoWithURL<T extends string, M> {
    url: string;
    method?: HTTPMethod;
    type?: T;
    pathParams?: boolean;
    meta?: M;
}
interface APIMetaInfoWithPath<T extends string, M> {
    baseURL?: string;
    path: string;
    method?: HTTPMethod;
    type?: T;
    pathParams?: boolean;
    meta?: M;
}
export declare type APIMetaInfo<T extends string, M> = APIMetaInfoWithURL<T, M> | APIMetaInfoWithPath<T, M>;
interface APIMetaWithoutBaseURL<T extends string, M> {
    [key: string]: APIMetaInfo<T, M>;
}
interface APIMetaWithBaseURL {
    _baseURL?: string;
}
export declare type APIMeta<T extends string, M> = APIMetaWithBaseURL & Omit<APIMetaWithoutBaseURL<T, M>, '_baseURL'>;
export interface ClientRequestOptions<T extends string, M, O> {
    url: string;
    name: string;
    meta?: M;
    options?: O;
    type?: T;
    body?: any;
}
export declare type APIzClient<T extends string, M, O, H extends HTTPMethodLowerCase> = {
    [K in H]?: (options: ClientRequestOptions<T, M, O>) => Promise<any>;
};
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
export interface APIzRequest<T, M, O> {
    (body: any, params: KVObject, query: KVObject | string, type: T): Promise<any>;
    (body?: any, params?: KVObject, query?: KVObject | string): Promise<any>;
    (body: any, params: KVObject | string, type: T): Promise<any>;
    (body: any, query: KVObject | string): Promise<any>;
    (body: any, type: T): Promise<any>;
    (params: KVObject, query?: KVObject | string): Promise<any>;
    (query: KVObject | string): Promise<any>;
    (clientOptions: O, optionsFlag: boolean): Promise<any>;
    readonly url: string;
    readonly method: HTTPMethodUpperCase;
    readonly meta: M;
    readonly type: T;
    readonly pathParams: boolean;
}
declare type ProxyMeta<T extends string, M, O, N extends APIMeta<T, M>> = {
    [K in keyof N]: APIzRequest<T, M, O>;
};
interface APIzMethod<T extends string, M> {
    add: (name: string, apiInfo: APIMetaInfo<T, M>) => this;
    remove: (name: string) => this;
}
export declare type APIzInstance<T extends string, M, O, N extends APIMeta<T, M>> = APIzMethod<T, M> & Omit<ProxyMeta<T, M, O, N>, 'add' | 'remove'>;
declare function APIz<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>, N extends APIMeta<T, M>>(apiMeta: N, options?: APIzOptions<C>): APIzInstance<T, M, O, N> | never;
export { APIz };
export declare function config<T extends string, M, O, C extends APIzClient<T, M, O, HTTPMethodLowerCase>>({ querystring, paramRegex, immutableMeta, client, reset, defaultType: dt }?: GlobalOptions<T, M, O, C>): void;
//# sourceMappingURL=core.d.ts.map