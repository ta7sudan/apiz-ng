/**
 * @Version 3.0.0
 * @Author: ta7sudan
 * @Repo: https://github.com/ta7sudan/apiz-ng#readme
 * @License: MIT
 */'use strict';Object.defineProperty(exports,"__esModule",{value:!0});const toString=Map.call.bind(Object.prototype.toString),isObj=a=>"[object Object]"===toString(a),isFn=a=>"function"==typeof a,isStr=a=>a&&"string"==typeof a,isEnumerable=Map.call.bind(Object.prototype.propertyIsEnumerable);let defaultType,globalQuerystring,globalParamRegex,globalClient,globalImmutableMeta=!1;const defaultParamRegex=/:((\w|-)+)/g,slashRegex=/\/\//g,methodMap={get:noBodyRequest,head:noBodyRequest,post:bodyRequest,put:bodyRequest,patch:bodyRequest,options:noBodyRequest,delete:noBodyRequest},replaceSlash=(a,b)=>6>=b?a:"/";function parseApiInfo(a,b,{baseURL:c,paramRegex:d,querystring:e,client:f}){let{url:g,baseURL:h,path:i,meta:j,method:k="GET",type:l=defaultType,pathParams:m=!1}=b;const n={},o=h||c;if("remove"===a||"add"===a)throw new Error("\"remove\" and \"add\" is preserved key.");if(!isObj(b))throw new TypeError(`API ${a} expected an object, but received ${JSON.stringify(b)}.`);if(isStr(g))n.url=g;else if(isStr(o))n.url=(o+(i||"")).replace(slashRegex,replaceSlash);else throw new Error(`API "${a}" must set url or baseURL correctly.`);k=k.toUpperCase();const p=k.toLowerCase();if(-1===["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"].indexOf(k))throw new Error(`Unsupported HTTP method: ${k}.`);if(!isFn(f[p]))throw new Error(`client must implement a ${p} function.`);const q=n.url.split(/\/(?=\w|:)/g),r=/^(https?:|\/)/.test(q[0])?2:1;return n.baseURL=q.slice(0,r).join("/"),n.path=`/${q.slice(r).join("/")}`,n.name=a,n.meta=j,n.method=k,n.methodLowerCase=p,n[p]=f[p],n.type=l,n.pathParams=m,n.regex=d,n.querystring=e,n.init=!0,n}function replaceParams(a){return(b,c)=>{if(null==a[c])throw new Error(`Can't find a property "${c}" in params.`);return encodeURIComponent(a[c])}}function noBodyRequest(...a){const{methodLowerCase:b,pathParams:c,regex:d,querystring:e,baseURL:f,path:g}=this;let h,i,j,k=this.url;if(!0===a[1])return this[b]({url:k,name:this.name,meta:this.meta,options:a[0]});if(c?(h=a[0],i=a[1]):i=a[0],h)k=f+g.replace(d,replaceParams(h));else if(c)throw new Error("Path params is required.");return i&&(j=e(i),k=-1===k.indexOf("?")?`${k}?${j}`:`${k}&${j}`),this[b]({url:k,name:this.name,meta:this.meta})}function bodyRequest(...a){const{methodLowerCase:b,type:c,pathParams:d,regex:e,querystring:f,baseURL:g,path:h}=this;let i,j,k,l,m,n=this.url;if(!0===a[1])return this[b]({url:n,type:l,name:this.name,meta:this.meta,options:a[0]});if(d?(i=a[1],j=a[2],l=a[3]||c):(j=a[1],l=a[2]||c),k=a[0],i)n=g+h.replace(e,replaceParams(i));else if(d)throw new Error("Path params is required.");return isStr(j)&&-1===j.indexOf("=")?l=j:j&&(m=f(j),n=-1===n.indexOf("?")?`${n}?${m}`:`${n}&${m}`),this[b]({url:n,type:l,body:k,name:this.name,meta:this.meta})}function createAPI(a){const b=methodMap[a.methodLowerCase],c=b.bind(a);return["url","method","meta","type","pathParams"].forEach(b=>{Object.defineProperty(c,b,{value:a[b],enumerable:!0,writable:!1})}),c}function APIz(a,b){let c,d,e,f,g,h={};if(isStr(a._baseURL)&&(c=a._baseURL),({baseURL:c=c,immutableMeta:d=globalImmutableMeta,paramRegex:e=globalParamRegex||defaultParamRegex,querystring:f=globalQuerystring,client:g=globalClient}=b||{}),!isFn(f))throw new Error("A querystring function must set.");if(!g)throw new Error("A client must set.");const i={baseURL:c,paramRegex:e,querystring:f,client:g};if(d)h=a||{};else for(const b in a)isObj(a[b])?h[b]=parseApiInfo(b,a[b],i):"_baseURL"!=b&&console.warn(`The ${b} in meta is not an object.`);const j=new Proxy({},{get(a,b,c){if(!h[b]||!isEnumerable(h,b))return Reflect.get(a,b);h[b].init||(h[b]=parseApiInfo(b,h[b],i));const d=createAPI(h[b]);return Reflect.set(c,b,d),d},getPrototypeOf(){return APIz.prototype}}),k=Object.create(j);return k.remove=function(a){return this[a]&&(h[a]=this[a]=void 0),this},k.add=function(a,b){if(h[a])throw new Error(`API "${a}" already exists.`);return h[a]=parseApiInfo(a,b,i),this[a]=createAPI(h[a]),this},k}function config({querystring:a,paramRegex:b,immutableMeta:c,client:d,reset:e,defaultType:f}={reset:!0}){isFn(a)&&(globalQuerystring=a),b instanceof RegExp&&(globalParamRegex=b),globalImmutableMeta=c,globalClient=d,defaultType=f,e&&(globalQuerystring=globalParamRegex=globalClient=defaultType=void 0,globalImmutableMeta=!1)}const querystring=function(a){return"[object Object]"===Object.prototype.toString.call(a)?Object.keys(a).map(b=>Array.isArray(a[b])?a[b].map(a=>`${encodeURIComponent(b)}=${encodeURIComponent(a)}`).join("&"):`${encodeURIComponent(b)}=${encodeURIComponent(a[b])}`).join("&"):"string"==typeof a?a:JSON.stringify(a)};config({querystring,defaultType:"json"}),exports.APIz=APIz,exports.config=config;
//# sourceMappingURL=apiz.cjs.js.map
