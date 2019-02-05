const getSystemName = (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};

const v1 = (() => {
    // json-complete 1.0.2 esm version, minified
    /* istanbul ignore next */
    const getLibrary = () => {
        var e=e=>Object.prototype.toString.call(e).slice(8,-1),r=(r,n)=>{if(void 0===n)return"un";if(null===n)return"nl";if(!0===n)return"tr";if(!1===n)return"fa";if("number"==typeof n){if(n===1/0)return"pI";if(n===-1/0)return"nI";if(n!=n)return"Na";if(0===n&&1/n==-1/0)return"n0"}let t=e(n);const o=r.e[t];return o&&"object"==typeof n&&(t=o),r.n[t]};const n=r=>{if("function"!=typeof Map||"Map"!==e(new Map))return!1;if("function"!=typeof Symbol||"Symbol"!==e(Symbol())||!r)return!0;const n={};n[Symbol()]=1;const t=new Map;for(let e=0;e<50;e+=1)t.set(Object.getOwnPropertySymbols(n)[0],{});return 1===t.size};var t=e=>{if(n(e)){const e=new Map;return{t:r=>e.get(r),o:(r,n)=>{e.set(r,n)},a:(r,n)=>{n=n||0;let t=0;return e.forEach(e=>{t>=n&&r(e),t+=1}),t}}}const r=[],t=[];return{t:e=>{for(let n=0;n<r.length;n+=1)if(r[n]===e)return t[n]},o:(e,n)=>{r.push(e),t.push(n)},a:(e,r)=>{let n;for(n=r||0;n<t.length;n+=1)e(t[n]);return n}}},o=(e,r)=>{const n=[],t={};Array.prototype.forEach.call(e,(e,r)=>{t[String(r)]=1,n.push(r)});let o=Object.keys(e).filter(e=>!t[e]);r&&(o=o.concat(Object.getOwnPropertySymbols(e).filter(e=>Symbol[String(e).slice(14,-1)]!==e)));let a=0;return n.concat(o).reduce((r,n)=>(n===a?(a+=1,r.u.push(e[n])):(r.c.push(n),r.i.push(e[n])),r),{u:[],c:[],i:[]})},a=e=>({f:e.slice(0,2),_:Number(e.slice(2))}),u=(e,r)=>{if(e.y[r])return e.y[r].l;const n=a(r);return e.y[n.f]?e.d[r].s:r},c=(e,r)=>{for(let n=0;n<r.p[0].length;n+=1)r.s[n]=u(e,r.p[0][n])},i=(e,r,n,t)=>{for(let o=0;o<(r.p[n]||[]).length;o+=1){const a=r.p[n][o];if("Sy"===a.slice(0,2)&&"function"!=typeof Symbol&&e.m)return;r.s[u(e,a)]=u(e,r.p[t][o])}},f=(e,r)=>{if(e.y[r])return e.y[r].l;const n=a(r);return e.y[n.f].b(e,e.w[n.f][n._])},_=(e,r)=>0===r.c.length?e:e.concat([r.c,r.i]);const y=r=>({g:e(new r),S:(e,r)=>_([Array.prototype.slice.call(new Uint8Array(e))],r),b:(e,n)=>{const t=n[0],o=new r(t.length),a=new Uint8Array(o);return t.forEach((r,n)=>{a[n]=f(e,r)}),o},A:(e,r)=>{c(e,r),i(e,r,1,2)}});var l=e=>("function"==typeof ArrayBuffer&&(e.AB=y(ArrayBuffer)),"function"==typeof SharedArrayBuffer&&(e.Sh=y(SharedArrayBuffer)),e),s=e=>(e.Ar={g:"Array",S:(e,r)=>_([r.u],r),b:()=>[],A:(e,r)=>{c(e,r),i(e,r,1,2)}},e.rg={g:"Arguments",S:(e,r)=>_([r.u],r),b:(e,r)=>(function(){return arguments}).apply(null,Array(r[0].length)),A:(e,r)=>{c(e,r),i(e,r,1,2)}},e),d=r=>({g:e(r("")),S:e=>String(e),b:(e,n)=>r(n),A:()=>{}}),p=e=>(e.St=d(String),e.Nu=d(Number),e),m=e=>("function"==typeof BigInt&&(e.Bi=d(BigInt)),e);const b=(e,r,n)=>({g:e,S:(e,n)=>_([[void 0].concat(r.map(r=>e[r]))],n),R:(e,r,n,t)=>{const o=new FileReader;o.addEventListener("loadend",()=>{r[0][0]=n(new Uint8Array(o.result)),t()}),o.readAsArrayBuffer(e)},b:(e,r)=>{const t=a(r[0][0]),o="un"===t.f?[]:e.w[t.f][t._][0];return n(e,[new Uint8Array(o.map(r=>f(e,r)))],r[0])},A:(e,r)=>{i(e,r,1,2)}});var w=e=>("function"==typeof Blob&&(e.Bl=b("Blob",["type"],(e,r,n)=>new Blob(r,{type:f(e,n[1])}))),"function"==typeof File&&(e.Fi=b("File",["type","name","lastModified"],(e,r,n)=>{try{return new File(r,f(e,n[2]),{type:f(e,n[1]),lastModified:f(e,n[3])})}catch(t){if(e.m){const t=new Blob(r,{type:f(e,n[1])});return t.name=f(e,n[2]),t.lastModified=f(e,n[3]),t}throw t}})),e),g=e=>(e.Da={g:"Date",S:(e,r)=>_([[e.valueOf()]],r),b:(e,r)=>new Date(f(e,r[0][0])),A:(e,r)=>{i(e,r,1,2)}},e);const v={EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};var S=e=>(e.Er={g:"Error",S:(e,r)=>_([[v[e.name]?e.name:"Error",e.message,e.stack]],r),b:(e,r)=>{const n=r[0],t=new(v[f(e,n[0])]||Error)(f(e,n[1]));return t.stack=f(e,n[2]),t},A:(e,r)=>{i(e,r,1,2)}},e),A=e=>("function"==typeof Set&&(e.Se={g:"Set",S:(e,r)=>{const n=[];return e.forEach(e=>{n.push(e)}),_([n],r)},b:()=>new Set,A:(e,r)=>{r.p[0].forEach(n=>{r.s.add(u(e,n))}),i(e,r,1,2)}},e.Ma={g:"Map",N:1,S:(e,r)=>{const n=[],t=[];return e.forEach((e,r)=>{n.push(r),t.push(e)}),_([n,t],r)},b:()=>new Map,A:(e,r)=>{for(let n=0;n<r.p[0].length;n+=1)r.s.set(u(e,r.p[0][n]),u(e,r.p[1][n]));i(e,r,2,3)}}),e),E=e=>(e.Ob={g:"Object",S:(e,r)=>_([],r),b:()=>({}),A:(e,r)=>{i(e,r,0,1)}},e);const R=e=>void 0===e.flags?e.options:e.flags;var N=e=>(e.Re={g:"RegExp",S:(e,r)=>_([[e.source,R(e),e.lastIndex]],r),b:(e,r)=>{const n=r[0],t=new RegExp(f(e,n[0]),f(e,n[1]));return t.lastIndex=f(e,n[2]),t},A:(e,r)=>{i(e,r,1,2)}},e),V=e=>(e.un={l:void 0},e.nl={l:null},e.tr={l:!0},e.fa={l:!1},e.pI={l:1/0},e.nI={l:-1/0},e.Na={l:NaN},e.n0={l:-0},e),h=e=>("function"==typeof Symbol&&(e.Sy={g:"Symbol",S:e=>{const r=Symbol.keyFor(e);return void 0!==r?`R${r}`:` ${String(e).slice(7,-1)}`},b:(e,r)=>"R"===r[0]?Symbol.for(r.slice(1)):Symbol(r.slice(1)),A:()=>{}}),e);const B=r=>({g:e(new r),S:(e,r)=>_([r.u],r),b:(e,n)=>new r(n[0].length),A:(e,r)=>{c(e,r),i(e,r,1,2)}});var F=e=>("function"==typeof Int8Array&&(e.I1=B(Int8Array),e.I2=B(Int16Array),e.I3=B(Int32Array),e.U1=B(Uint8Array),e.U2=B(Uint16Array),e.U3=B(Uint32Array),e.F3=B(Float32Array)),"function"==typeof Uint8ClampedArray&&(e.C1=B(Uint8ClampedArray)),"function"==typeof Float64Array&&(e.F4=B(Float64Array)),e);const M=r=>({g:`_${e(new r(""))}`,S:(e,r)=>_([[e.valueOf()]],r),b:(e,n)=>new r(f(e,n[0][0])),A:(e,r)=>{i(e,r,1,2)}});var O=e=>(e.Bo=M(Boolean),e.NU=M(Number),e.ST=M(String),e);let U={};var I=U=m(U=w(U=l(U=F(U=A(U=h(U=S(U=N(U=g(U=E(U=s(U=O(U=p(U=V(U))))))))))))));const j=(n,t)=>{const o=r(n,t);if(!o&&!n.m){const r=e(t);throw new Error(`Cannot encode unsupported type "${r}".`)}return o||"Ob"},x=(e,r)=>{const n=j(e,r);if(!e.y[n].A)return n;const t=e.V.t(r,n);if(void 0!==t)return t.h;e.B[n]=e.B[n]||[],e.B[n].push(0);const o=e.B[n].length-1,a={f:n,_:o,h:n+o,s:r};return e.V.o(r,a),e.y[n].R&&e.F.push(a),a.h},$=(r,n)=>r.V.a(n=>{let t=I[n.f].S(n.s,o(n.s,r.M));"String"!==e(t)&&(t=t.map(e=>e.map(e=>x(r,e)))),r.B[n.f][n._]=t},n),C=(e,r)=>{e.B.r=r,e.B.v="1.0.0";const n=JSON.stringify(Object.keys(e.B).map(r=>[r,e.B[r]]));if("function"!=typeof e.O)return n;e.O(n)};var k=(e,r)=>{r=r||{};let n={},o={};Object.keys(I).forEach(e=>{const r=I[e].g;r&&(n[r]=e),"_"===(r||"")[0]&&(o[r.slice(1)]=r)});const a={m:r.compat,M:r.encodeSymbolKeys,O:r.onFinish,y:I,n:n,e:o,V:t(r.encodeSymbolKeys),F:[],B:{}},u=x(a,e),c=$(a);if(!(a.F.length>0))return C(a,u);{if("function"!=typeof r.onFinish){if(a.m)return C(a,u);throw new Error("Deferred Types require onFinish option.")}let e=a.F.length;const n=()=>{if(0===(e-=1))return $(a,c),C(a,u)};a.F.forEach(e=>{I[e.f].R(e.s,a.B[e.f][e._],e=>x(a,e),n)})}};const T=(r,n)=>{"Array"===e(n)?n.forEach(e=>{T(r,e)}):r.U.push(n)},z=(r,n)=>{const t=a(n);if(!I[t.f]){if(r.m)return;throw new Error(`Cannot decode unrecognized pointer type "${t.f}".`)}if(!I[n]&&void 0===r.d[n]){r.d[n]={f:t.f,_:t._,h:n,s:void 0,p:r.w[t.f][t._]};try{r.d[n].s=I[t.f].b(r,r.w[t.f][t._])}catch(e){if(!r.m)throw new Error(`Cannot decode recognized pointer type "${t.f}".`)}"Array"===e(r.d[n].p)&&T(r,r.d[n].p)}};var D=(e,r)=>{const n={m:(r=r||{}).compat,y:I,w:JSON.parse(e).reduce((e,r)=>(e[r[0]]=r[1],e),{}),d:{},U:[]},t=n.w.r;if(I[t])return I[t].l;const o=a(t);if(!I[o.f]){if(n.m)return t;throw new Error(`Cannot decode unrecognized pointer type "${o.f}".`)}for(n.U.push(t);n.U.length;)z(n,n.U.shift());return Object.values(n.d).forEach(e=>{I[e.f].A(n,e)}),n.d[t].s},J={encode:k,decode:D};
        return J;
    };

    return {
        ...getLibrary(),
        _isInFamily: (version) => {
            return version === '1.0.0' || version === '1.0.1' || version === '1.0.2';
        },
    };
})();

const v2 = (() => {
    // json-complete 2.0.0 esm version, minified
    /* istanbul ignore next */
    const getLibrary = () => {
        var e=e=>e.split(/([A-Z$_]+)/),r=r=>{const n=e(r);return{e:n[1],r:Number(n[2])}},n="0123456789abcdefghijklmnopqrstuvwxyz!#%&'()*+-./:;<=>?@[]^`{|}~";const t=n.length;var o=e=>{let r="";do{r=n[e%t]+r,e=Math.floor(e/t)}while(e);return r},c=(e,n,t)=>t[e]&&0!==t[e].n?1===t[e].n?n.join(","):n.map(e=>e.map(e=>e.map(e=>{const n=r(e);return n.e+o(n.r)}).join("")).join(" ")).join(","):n,a=e=>Object.prototype.toString.call(e).slice(8,-1),i=(e,r)=>{if(void 0===r)return"K";if(null===r)return"L";if(!0===r)return"T";if(!1===r)return"F";if("number"==typeof r){if(r===1/0)return"I";if(r===-1/0)return"J";if(r!=r)return"C";if(0===r&&1/r==-1/0)return"M"}if("function"==typeof Set&&r instanceof Set)return"U";if("function"==typeof Map&&r instanceof Map)return"V";let n=a(r);const t=e.t[n];return t&&"object"==typeof r&&(n=t),e.o[n]};const u=e=>{if("function"!=typeof Map||"Map"!==a(new Map))return!1;if("function"!=typeof Symbol||"Symbol"!==a(Symbol())||!e)return!0;const r={};r[Symbol()]=1;const n=new Map;for(let e=0;e<50;e+=1)n.set(Object.getOwnPropertySymbols(r)[0],{});return 1===n.size};var y=e=>{if(u(e)){const e=new Map;return{c:r=>e.get(r),a:(r,n)=>{e.set(r,n)},i:(r,n)=>{n=n||0;let t=0;return e.forEach(e=>{t>=n&&r(e),t+=1}),t}}}const r=[],n=[];return{c:e=>{for(let t=0;t<r.length;t+=1)if(r[t]===e)return n[t]},a:(e,t)=>{r.push(e),n.push(t)},i:(e,r)=>{let t;for(t=r||0;t<n.length;t+=1)e(n[t]);return t}}},f=(e,r)=>{const n=[],t={};Array.prototype.forEach.call(e,(e,r)=>{t[String(r)]=1,n.push(r)});let o=Object.keys(e).filter(e=>!t[e]);r&&"function"==typeof Symbol&&(o=o.concat(Object.getOwnPropertySymbols(e).filter(e=>Symbol[String(e).slice(14,-1)]!==e)));let c=0;return n.concat(o).reduce((r,n)=>(n===c?(c+=1,r.u.push(e[n])):(r.y.push(n),r.f.push(e[n])),r),{u:[],y:[],f:[]})},s=(e,n)=>{if(e.s[n])return e.s[n].p;const t=r(n);return e.s[t.e]?e.d[n].l:n},_=(e,r)=>{for(let n=0;n<r.m[0].length;n+=1)r.l[n]=s(e,r.m[0][n])},p=(e,n,t,o)=>{for(let c=0;c<(n.m[t]||[]).length;c+=1){const a=n.m[t][c];e.b&&"function"!=typeof Symbol&&"P"===r(a).e||(n.l[s(e,a)]=s(e,n.m[o][c]))}},l=(e,n)=>{if(e.s[n])return e.s[n].p;const t=r(n);return e.s[t.e].g(e,e.w[t.e][t.r])},d=(e,r)=>0===r.y.length?e:e.concat([r.y,r.f]);const m=e=>({v:a(new e),n:2,h:(e,r)=>d([Array.prototype.slice.call(new Uint8Array(e))],r),g:(r,n)=>{const t=n[0],o=new e(t.length),c=new Uint8Array(o);return t.forEach((e,n)=>{c[n]=l(r,e)}),o},x:(e,r)=>{_(e,r),p(e,r,1,2)}});var b=e=>("function"==typeof ArrayBuffer&&(e.W=m(ArrayBuffer)),"function"==typeof SharedArrayBuffer&&(e.X=m(SharedArrayBuffer)),e),g=e=>(e.A={v:"Array",n:2,h:(e,r)=>d([r.u],r),g:()=>[],x:(e,r)=>{_(e,r),p(e,r,1,2)}},e.Q={v:"Arguments",n:2,h:(e,r)=>d([r.u],r),g:(e,r)=>(function(){return arguments}).apply(null,Array(r[0].length)),x:(e,r)=>{_(e,r),p(e,r,1,2)}},e),A=(e,r)=>({v:a(e("")),n:r||0,j:1,h:e=>String(e),g:(r,n)=>e(n),x:()=>{}}),w=e=>(e.S=A(String),e.N=A(Number,1),e),v=e=>({v:a(new e),n:2,h:(e,r)=>d([r.u],r),g:(r,n)=>new e(n[0].length),x:(e,r)=>{_(e,r),p(e,r,1,2)}}),S=e=>("function"==typeof BigInt&&(e._=A(BigInt,1)),"function"==typeof BigInt64Array&&(e.BI=v(BigInt64Array)),"function"==typeof BigUint64Array&&(e.BU=v(BigUint64Array)),e);const E=(e,n,t)=>({v:e,n:2,h:(e,r)=>d([[void 0].concat(n.map(r=>e[r]))],r),k:(e,r,n,t)=>{const o=new FileReader;o.addEventListener("loadend",()=>{r[0][0]=n(new Uint8Array(o.result)),t()}),o.readAsArrayBuffer(e)},g:(e,n)=>{const o=r(n[0][0]),c="K"===o.e?[]:e.w[o.e][o.r][0];return t(e,[new Uint8Array(c.map(r=>l(e,r)))],n[0])},x:(e,r)=>{p(e,r,1,2)}});var R=e=>("function"==typeof Blob&&(e.Y=E("Blob",["type"],(e,r,n)=>new Blob(r,{type:l(e,n[1])})),e.Z=E("File",["type","name","lastModified"],(e,r,n)=>{try{return new File(r,l(e,n[2]),{type:l(e,n[1]),lastModified:l(e,n[3])})}catch(t){if(e.b){const t=new Blob(r,{type:l(e,n[1])});return t.name=l(e,n[2]),t.lastModified=l(e,n[3]),t}throw t}})),e),N=e=>(e.D={v:"Date",n:2,h:(e,r)=>d([[e.valueOf()]],r),g:(e,r)=>new Date(l(e,r[0][0])),x:(e,r)=>{p(e,r,1,2)}},e);const h={EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};var T=e=>(e.E={v:"Error",n:2,h:(e,r)=>d([[h[e.name]?e.name:"Error",e.message,e.stack]],r),g:(e,r)=>{const n=r[0],t=new(h[l(e,n[0])]||Error)(l(e,n[1]));return t.stack=l(e,n[2]),t},x:(e,r)=>{p(e,r,1,2)}},e),U=e=>("function"==typeof Set&&(e.U={v:"Set",n:2,h:(e,r)=>{const n=[];return e.forEach(e=>{n.push(e)}),d([n],r)},g:()=>new Set,x:(e,r)=>{r.m[0].forEach(n=>{r.l.add(s(e,n))}),p(e,r,1,2)}}),"function"==typeof Map&&(e.V={v:"Map",n:2,h:(e,r)=>{const n=[],t=[];return e.forEach((e,r)=>{n.push(r),t.push(e)}),d([n,t],r)},g:()=>new Map,x:(e,r)=>{for(let n=0;n<r.m[0].length;n+=1)r.l.set(s(e,r.m[0][n]),s(e,r.m[1][n]));p(e,r,2,3)}}),e),M=e=>(e.O={v:"Object",n:2,h:(e,r)=>d([],r),g:()=>({}),x:(e,r)=>{p(e,r,0,1)}},e);const B=e=>{try{const r=new RegExp(" ",e);return"RegExp"===a(r)}catch(e){return!1}},V=B("y"),I=B("u");var x=e=>(e.R={v:"RegExp",n:2,h:(e,r)=>{let n=e.flags;return void 0===n&&(n=e.options),d([[e.source,n,e.lastIndex]],r)},g:(e,r)=>{const n=r[0];let t=l(e,n[1]);e.b&&(V||(t=t.replace(/y/g,"")),I||(t=t.replace(/u/g,"")));const o=new RegExp(l(e,n[0]),t);return o.lastIndex=l(e,n[2]),o},x:(e,r)=>{p(e,r,1,2)}},e),F=e=>(e.K={p:void 0},e.L={p:null},e.T={p:!0},e.F={p:!1},e.I={p:1/0},e.J={p:-1/0},e.C={p:NaN},e.M={p:-0},e),O=e=>("function"==typeof Symbol&&(e.P={v:"Symbol",n:0,j:1,h:e=>{const r=Symbol.keyFor(e);return void 0!==r?`r${r}`:`s${String(e).slice(7,-1)}`},g:(e,r)=>"r"===r[0]?Symbol.for(r.slice(1)):Symbol(r.slice(1)),x:()=>{}}),e),j=e=>("function"==typeof Int8Array&&(e.IE=v(Int8Array)),"function"==typeof Int16Array&&(e.IS=v(Int16Array)),"function"==typeof Int32Array&&(e.IT=v(Int32Array)),"function"==typeof Uint8Array&&(e.$=v(Uint8Array)),"function"==typeof Uint8ClampedArray&&(e.UC=v(Uint8ClampedArray)),"function"==typeof Uint16Array&&(e.US=v(Uint16Array)),"function"==typeof Uint32Array&&(e.UT=v(Uint32Array)),"function"==typeof Float32Array&&(e.FT=v(Float32Array)),"function"==typeof Float64Array&&(e.FS=v(Float64Array)),e);const $=e=>({v:`_${a(new e(""))}`,n:2,h:(e,r)=>d([[e.valueOf()]],r),g:(r,n)=>new e(l(r,n[0][0])),x:(e,r)=>{p(e,r,1,2)}});var C=e=>(e.B=$(Boolean),e.G=$(String),e.H=$(Number),e);let k={};var z=k=S(k=R(k=b(k=j(k=U(k=O(k=T(k=x(k=N(k=M(k=g(k=C(k=w(k=F(k))))))))))))));const D=(e,r)=>{const n=i(e,r);if(!n&&!e.b){const e=a(r);throw new Error(`Cannot encode unsupported type "${e}".`)}return n||"O"},J=(e,r)=>{const n=D(e,r);if(!e.s[n].x)return n;const t=e.z.c(r,n);if(void 0!==t)return t.q;e.ee[n]=e.ee[n]||[],e.ee[n].push(0);const o=e.ee[n].length-1,c={e:n,r:o,q:n+o,l:r};return e.z.a(r,c),e.s[n].k&&e.re.push(c),c.q},K=(e,r)=>e.z.i(r=>{let n=[];z[r.e].j||(n=f(r.l,e.ne));let t=z[r.e].h(r.l,n);"String"!==a(t)&&(t=t.map(r=>r.map(r=>J(e,r)))),e.ee[r.e][r.r]=t},r),q=(e,r)=>{const n=JSON.stringify([r,"2.0.0"].concat(Object.keys(e.ee).map(r=>[r,c(r,e.ee[r],e.s)])));if("function"!=typeof e.te)return n;e.te(n)};var L=(e,r)=>{r=r||{};let n={},t={};Object.keys(z).forEach(e=>{const r=z[e].v;r&&(n[r]=e),"_"===(r||"")[0]&&(t[r.slice(1)]=r)});const o={b:r.compat,ne:r.encodeSymbolKeys,te:r.onFinish,s:z,o:n,t:t,z:y(r.encodeSymbolKeys),re:[],ee:{}},c=J(o,e),a=K(o);if(!(o.re.length>0))return q(o,c);{if("function"!=typeof r.onFinish){if(o.b)return q(o,c);throw new Error("Deferred Types require onFinish option.")}let e=o.re.length;const n=()=>{if(0===(e-=1))return K(o,a),q(o,c)};o.re.forEach(e=>{z[e.e].k(e.l,o.ee[e.e][e.r],e=>J(o,e),n)})}};const P=n.length;var Z=e=>e.split("").reduce((e,r)=>e*P+n.indexOf(r),0),G=(r,n,t)=>t[r]&&0!==t[r].n?1===t[r].n?n.split(","):n.split(",").map(r=>r.split(" ").map(r=>{const n=e(r).slice(1),o=[];for(let e=0;e<n.length;e+=2){const r=n[e],c=t[r]&&!t[r].v;o.push(c?r:r+Z(n[e+1]))}return o})):n;const H=(e,r)=>{"Array"===a(r)?r.forEach(r=>{H(e,r)}):e.oe.push(r)},Q=(e,n)=>{const t=r(n);if(!z[t.e]){if(e.b)return;throw new Error(`Cannot decode unrecognized pointer type "${t.e}".`)}if(!z[n]&&void 0===e.d[n]){e.d[n]={e:t.e,r:t.r,q:n,l:void 0,m:e.w[t.e][t.r]};try{e.d[n].l=z[t.e].g(e,e.w[t.e][t.r])}catch(r){if(!e.b)throw new Error(`Cannot decode recognized pointer type "${t.e}".`)}"Array"===a(e.d[n].m)&&H(e,e.d[n].m)}};var W=(e,n)=>{n=n||{};const t=JSON.parse(e),o=t.slice(2).reduce((e,r)=>(e[r[0]]=G(r[0],r[1],z),e),{}),c=t[0],a={b:n.compat,s:z,w:o,d:{},oe:[]};if(z[c])return z[c].p;const i=r(c);if(!z[i.e]){if(a.b)return c;throw new Error(`Cannot decode unrecognized pointer type "${i.e}".`)}for(a.oe.push(c);a.oe.length;)Q(a,a.oe.shift());return Object.keys(a.d).forEach(e=>{const r=a.d[e];z[r.e].x(a,r)}),a.d[c].l},X={encode:L,decode:W};
        return X;
    };

    return {
        ...getLibrary(),
        _isInFamily: (version) => {
            return version === '2.0.0';
        },
    };
})();

const convertableVersions = [
    '1.0.0',
    '2.0.0',
];

const determineVersion = (encoded) => {
    // Could throw if invalid JSON
    const data = JSON.parse(encoded);

    if (getSystemName(data) !== 'Array') {
        throw new Error('Encoded data is not in Array form. Cannot determine version of encoded json-complete data.');
    }

    if (getSystemName(data[0]) === 'String' && getSystemName(data[1]) === 'String' && v2._isInFamily(data[1])) {
        return '2.0.0';
    }

    const versionItem = data.find((item) => {
        return getSystemName(item) === 'Array' && item[0] === 'v';
    });

    if (versionItem && getSystemName(versionItem[1]) === 'String' && v1._isInFamily(versionItem[1])) {
        return '1.0.0';
    }

    throw new Error('Cannot determine version of encoded json-complete data. Are you using an version of convertTo older than your data?');
};

const isEquivalentVersion = (fromVersion, toVersion) => {
    return (v2._isInFamily(fromVersion) && v2._isInFamily(toVersion)) ||
           (v1._isInFamily(fromVersion) && v1._isInFamily(toVersion));
};

const decompress = (encoded, version) => {
    if (v2._isInFamily(version)) {
        return v2.decode(encoded);
    }

    if (v1._isInFamily(version)) {
        return v1.decode(encoded);
    }

    throw new Error(`Cannot recognize version for decompression: ${version}`);
};

const recompress = (data, version) => {
    if (v2._isInFamily(version)) {
        return v2.encode(data);
    }

    if (v1._isInFamily(version)) {
        return v1.encode(data);
    }

    throw new Error(`Cannot recognize version for recompression: ${version}`);
};

export default (encoded, outputVersion) => {
    if (convertableVersions.indexOf(outputVersion) === -1) {
        throw new Error(`No encoder found for expected output version of json-complete data. Are you sure you have specified the correct output version? The available conversions are: ${convertableVersions.join(', ')}`);
    }

    const inputVersion = determineVersion(encoded);

    // Data is already in the expected form
    if (isEquivalentVersion(inputVersion, outputVersion)) {
        return encoded;
    }

    const data = decompress(encoded, inputVersion);

    return recompress(data, outputVersion);
};
