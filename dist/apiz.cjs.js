/**
 * @Version 0.1.3
 * @Author: ta7sudan
 * @Repo: https://github.com/ta7sudan/apiz-ng#readme
 * @License: MIT
 */"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const toString=Map.call.bind(Object.prototype.toString),isObj=a=>"[object Object]"===toString(a),isFn=a=>"function"==typeof a,isStr=a=>a&&"string"==typeof a,isEnumerable=Map.call.bind(Object.prototype.propertyIsEnumerable);let defaultType,globalQuerystring,globalParamRegex,globalClient,globalImmutableMeta=!1;const defaultParamRegex=/(?<=\/):((\w|-)+)/g,methodMap={GET:noBodyRequest,HEAD:noBodyRequest,POST:bodyRequest,PUT:bodyRequest,PATCH:bodyRequest,OPTIONS:noBodyRequest,DELETE:noBodyRequest};function parseApiInfo(a,b,{baseURL:c,paramRegex:d,querystring:e,client:f}){let{url:g,baseURL:h,path:i,method:j="GET",type:k=defaultType,pathParams:l=!1}=b;const m={},n=h||c;if("remove"===a||"add"===a)throw new Error("\"remove\" and \"add\" is preserved key.");if(!isObj(b))throw new TypeError(`API ${a} expected an object, but received ${JSON.stringify(b)}.`);if(isStr(g))m.url=g;else if(isStr(n))m.url=(n+(i||"")).replace(/(?<!:)(\/\/)/g,"/");else throw new Error(`API "${a}" must set url or baseURL correctly.`);j=j.toUpperCase();let o=j.toLowerCase();if(!["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"].includes(j))throw new Error(`Unsupported HTTP method: ${j}.`);if(!isFn(f[o]))throw new Error(`client must implement a ${o} function.`);return m.method=j,m.methodLowerCase=o,m[o]=f[o],m.type=k,m.pathParams=l,m.regex=d,m.querystring=e,m.init=!0,m}function replaceParams(a){return(b,c)=>{if(null==a[c])throw new Error(`Can't find a property "${c}" in params.`);return encodeURIComponent(a[c])}}function noBodyRequest(...a){const{methodLowerCase:b,pathParams:c,regex:d,querystring:e}=this;let f,g,h,i=this.url;if(!0===a[1])return this[b](i,a[0]);if(c?(f=a[0],g=a[1]):g=a[0],f)i=i.replace(d,replaceParams(f));else if(c)throw new Error("Path params is required.");return g&&(h=e(g),i=i.includes("?")?`${i}&${h}`:`${i}?${h}`),this[b](i)}function bodyRequest(...a){const{methodLowerCase:b,type:c,pathParams:d,regex:e,querystring:f}=this;let g,h,i,j,k,l=this.url;if(!0===a[1])return this[b](l,a[0],j,!0);if(d?(g=a[1],h=a[2],j=a[3]||c):(h=a[1],j=a[2]||c),i=a[0],g)l=l.replace(e,replaceParams(g));else if(d)throw new Error("Path params is required.");return isStr(h)&&!h.includes("=")?j=h:h&&(k=f(h),l=l.includes("?")?`${l}&${k}`:`${l}?${k}`),this[b](l,i,j,!1)}function createAPI(a){const b=methodMap[a.method].bind(a);return["url","method","type","pathParams"].forEach(c=>{Object.defineProperty(b,c,{value:a[c],enumerable:!0,writable:!1})}),b}function APIz(a,b){let c,d,e,f,g,h={};if(isStr(a._baseURL)&&(c=a._baseURL),({baseURL:c=c,immutableMeta:d=globalImmutableMeta,paramRegex:e=globalParamRegex||defaultParamRegex,querystring:f=globalQuerystring,client:g=globalClient}=b||{}),!isFn(f))throw new Error("A querystring function must set.");if(!g)throw new Error("A client must set.");const i={baseURL:c,paramRegex:e,querystring:f,client:g};if(d)h=a||{};else for(const b in a)isObj(a[b])?h[b]=parseApiInfo(b,a[b],i):"_baseURL"!=b&&console.warn(`The ${b} in meta is not an object.`);const j=new Proxy({},{get(a,b,c){if(!h[b]||!isEnumerable(h,b))return Reflect.get(a,b);h[b].init||(h[b]=parseApiInfo(b,h[b],i));const d=createAPI(h[b]);return Reflect.set(c,b,d),d},getPrototypeOf(){return APIz.prototype}}),k=Object.create(j);return k.remove=function(a){this[a]&&(h[a]=this[a]=void 0)},k.add=function(a,b){if(h[a])throw new Error(`API "${a}" already exists.`);h[a]=parseApiInfo(a,b,i),this[a]=createAPI(h[a])},k}function config({querystring:a,paramRegex:b,immutableMeta:c,client:d,reset:e,defaultType:f}={reset:!0}){isFn(a)&&(globalQuerystring=a),b instanceof RegExp&&(globalParamRegex=b),globalImmutableMeta=c,globalClient=d,defaultType=f,e&&(globalQuerystring=globalParamRegex=globalClient=defaultType=void 0,globalImmutableMeta=!1)}function querystring(a){return"[object Object]"===Object.prototype.toString.call(a)?Object.keys(a).map(b=>Array.isArray(a[b])?a[b].map(a=>`${encodeURIComponent(b)}=${encodeURIComponent(a)}`).join("&"):`${encodeURIComponent(b)}=${encodeURIComponent(a[b])}`).join("&"):"string"==typeof a?a:JSON.stringify(a)}config({querystring,defaultType:"json"}),exports.APIz=APIz,exports.config=config;
//# sourceMappingURL=apiz.cjs.js.map
