/**
 * @Version 4.0.5
 * @Author: ta7sudan
 * @Repo: https://github.com/ta7sudan/apiz-ng#readme
 * @License: MIT
 */'use strict';Object.defineProperty(exports,"__esModule",{value:!0});const toString=Map.call.bind(Object.prototype.toString),isStr=a=>a&&"string"==typeof a,isFn=a=>"function"==typeof a,isObj=a=>"[object Object]"===toString(a),isEnumerable=Map.call.bind(Object.prototype.propertyIsEnumerable);let globalQuerystring,globalParamRegex,globalClient,defaultType,globalIsArgsImmutable=!1;const defaultParamRegex=/:((\w|-)+)/g,slashRegex=/\/\//g,replaceSlash=(a,b)=>6>=b?a:"/";function isAPIInfoWithURL(a){return!!a.url}function parseApiInfo(a,b,{baseURL:c,paramRegex:d,querystring:e,client:f}){const{method:h="GET",type:i=defaultType,meta:g}=b;let j,k,l;if("remove"===a||"add"===a)throw new Error("\"remove\" and \"add\" is preserved key.");isAPIInfoWithURL(b)?j=b.url:(k=b.baseURL,l=b.path);const m={},n=k||c;if(!isObj(b))throw new TypeError(`API ${a} expected an object, but received ${JSON.stringify(b)}.`);if(isStr(j))m.url=j;else if(isStr(n))m.url=(n+(l||"")).replace(slashRegex,replaceSlash);else throw new Error(`API "${a}" must set url or baseURL correctly.`);const o=h.toUpperCase(),p=h.toLowerCase();if(-1===["GET","HEAD","POST","PUT","PATCH","DELETE","OPTIONS"].indexOf(o))throw new Error(`Unsupported HTTP method: ${o}.`);if(!isFn(f[p]))throw new Error(`client must implement a ${p} function.`);const q=m.url.split(/\/(?=\w|:)/g),r=/^(https?:|\/)/.test(q[0])?2:1;return m.baseURL=q.slice(0,r).join("/"),m.path=`/${q.slice(r).join("/")}`,m.name=a,m.meta=g,m.method=o,m.methodLowerCase=p,m.client=f,m.type=i,m.regex=d,m.querystring=e,m.init=!0,m}function replaceParams(a){return(b,c)=>{if(null==a[c])throw new Error(`Can't find a property "${c}" in params.`);return encodeURIComponent(a[c])}}function request(a,b){const{methodLowerCase:c,type:d,regex:e,querystring:f,baseURL:g,path:h,client:i,meta:j}=this;let k,{query:l,params:m,body:n,headers:o,type:p,handleError:q}=a||{},r=this.url;return!0===b?i[c]({url:r,name:this.name,handleError:q,options:a}):(null==p&&"get"!==c&&"head"!==c&&(p=d),m&&(r=g+h.replace(e,replaceParams(m))),l&&(k=f(l),r=-1===r.indexOf("?")?`${r}?${k}`:`${r}&${k}`),i[c]({url:r,name:this.name,handleError:q,meta:j,type:p,body:n,headers:o,query:l}))}function createAPI(a){const b=request.bind(a);return["url","method","meta","type"].forEach(c=>{Object.defineProperty(b,c,{value:a[c],enumerable:!0,writable:!1})}),b}function APIz(a,b){let c,d,e,f,g,h={};if(isStr(a.baseURL)&&(c=a.baseURL),({baseURL:c=c,immutable:d=globalIsArgsImmutable,paramRegex:e=globalParamRegex||defaultParamRegex,querystring:f=globalQuerystring,client:g=globalClient}=b||{}),!isFn(f))throw new Error("A querystring function must set.");if(!g)throw new Error("A client must set.");const i={baseURL:c,paramRegex:e,querystring:f,client:g},j=a.apis;if(d)h=j||{};else for(const a in j)isObj(j[a])?h[a]=parseApiInfo(a,j[a],i):console.warn(`The ${a} in meta is not an object.`);const k=new Proxy({},{get(a,b,c){if(!h[b]||!isEnumerable(h,b))return Reflect.get(a,b);h[b].init||(h[b]=parseApiInfo(b,h[b],i));const d=createAPI(h[b]);return Reflect.set(c,b,d),d},getPrototypeOf(){return APIz.prototype}}),l=Object.create(k);return l.remove=function(a){return this[a]&&(h[a]=this[a]=void 0),this},l.add=function(a,b){if(h[a])throw new Error(`API "${a}" already exists.`);return h[a]=parseApiInfo(a,b,i),this[a]=createAPI(h[a]),this},l}function config({querystring:a,paramRegex:b,immutable:c,client:d,reset:e,defaultType:f}={reset:!0}){isFn(a)&&(globalQuerystring=a),b instanceof RegExp&&(globalParamRegex=b),globalIsArgsImmutable=c,globalClient=d,defaultType=f,e&&(globalQuerystring=globalParamRegex=globalClient=defaultType=void 0,globalIsArgsImmutable=!1)}const querystring=function(a){return"[object Object]"===Object.prototype.toString.call(a)?Object.keys(a).map(b=>Array.isArray(a[b])?a[b].map(a=>`${encodeURIComponent(b)}=${encodeURIComponent(null==a?"":a)}`).join("&"):`${encodeURIComponent(b)}=${encodeURIComponent(null==a[b]?"":a[b])}`).join("&"):"string"==typeof a?a:JSON.stringify(a)};config({querystring,defaultType:"json"}),exports.APIz=APIz,exports.config=config;
//# sourceMappingURL=apiz.cjs.js.map
