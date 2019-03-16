import { Omit } from 'type-fest';
declare type HTTPMethodUpperCase = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
declare type HTTPMethodLowerCase = 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
declare type HTTPMethod = HTTPMethodUpperCase | HTTPMethodLowerCase;
export declare type Serialize2QueryString = (obj: any) => string;
interface APIzRequest<T, M> {
    (body: any, params: KVObject, query: KVObject | string, type: T): Promise<any>;
    (body?: any, params?: KVObject, query?: KVObject | string): Promise<any>;
    (body: any, params: KVObject | string, type: T): Promise<any>;
    (body: any, query: KVObject | string): Promise<any>;
    (body: any, type: T): Promise<any>;
    (params: KVObject, query?: KVObject | string): Promise<any>;
    (query: KVObject | string): Promise<any>;
    url: string;
    method: HTTPMethodUpperCase;
    meta: M;
    type: T;
    pathParams: boolean;
}
interface KVObject {
    [k: string]: any;
}
declare type ProxyMeta<T extends string, M, N extends APIMeta<T, M>> = {
    [K in keyof N]: APIzRequest<T, M>;
};
interface APIzMethod<T extends string, M> {
    add: (name: string, apiInfo: APIMetaInfo<T, M>) => this;
    remove: (name: string) => this;
}
declare type APIzInstance<T extends string, M, N extends APIMeta<T, M>> = APIzMethod<T, M> & Omit<ProxyMeta<T, M, N>, 'add' | 'remove'>;
interface GlobalOptions<T extends string, M, O, C extends APIzClient<T, M, O>> {
    client?: C;
    paramRegex?: RegExp;
    defaultType?: string;
    immutableMeta?: boolean;
    reset?: boolean;
    querystring?(obj: object): string;
}
interface APIzOptions<C> {
    baseURL?: string;
    client: C;
    immutableMeta?: boolean;
    paramRegex?: RegExp;
    querystring?: Serialize2QueryString;
}
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
declare type APIMetaInfo<T extends string, M> = APIMetaInfoWithURL<T, M> | APIMetaInfoWithPath<T, M>;
interface APIMetaWithoutBaseURL<T extends string, M> {
    [key: string]: APIMetaInfo<T, M> | undefined;
}
interface APIMetaWithBaseURL {
    _baseURL?: string;
}
interface ClientRequestOptions<T extends string, M, O> {
    url: string;
    name: string;
    meta?: M;
    options?: O;
    type?: T;
    body?: any;
}
interface APIzClient<T extends string, M, O> {
    get?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    head?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    delete?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    options?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    post?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    put?(options: ClientRequestOptions<T, M, O>): Promise<any>;
    patch?(options: ClientRequestOptions<T, M, O>): Promise<any>;
}
declare type APIMeta<T extends string, M> = APIMetaWithBaseURL & Omit<APIMetaWithoutBaseURL<T, M>, '_baseURL'>;
declare function APIz<T extends string, M, O, C extends APIzClient<T, M, O>, N extends APIMeta<T, M>>(apiMeta: N, options: APIzOptions<C>): APIzInstance<T, M, N>;
export { APIz };
export declare function config<T extends string, M, O, C extends APIzClient<T, M, O>>({ querystring, paramRegex, immutableMeta, client, reset, defaultType: dt }?: GlobalOptions<T, M, O, C>): void;
//# sourceMappingURL=core.d.ts.map