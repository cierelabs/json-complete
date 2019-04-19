const getSystemName = (v) => {
    return Object.prototype.toString.call(v).slice(8, -1);
};

const v1 = (() => {
    // json-complete 1.0.2 esm version, backported to support IE11, IE10, and IE9, minified
    /* istanbul ignore next */
    const library = (() => {
        var e=e=>Object.prototype.toString.call(e).slice(8,-1),r=(r,n)=>{if(void 0===n)return"un";if(null===n)return"nl";if(!0===n)return"tr";if(!1===n)return"fa";if("number"==typeof n){if(n===1/0)return"pI";if(n===-1/0)return"nI";if(n!=n)return"Na";if(0===n&&1/n==-1/0)return"n0"}if("function"==typeof Set&&n instanceof Set)return"Se";if("function"==typeof Map&&n instanceof Map)return"Ma";let t=e(n);const o=r.t[t];return o&&"object"==typeof n&&(t=o),r.o[t]};const n=r=>{if("function"!=typeof Map||"Map"!==e(new Map))return!1;if("function"!=typeof Symbol||"Symbol"!==e(Symbol())||!r)return!0;const n={};n[Symbol()]=1;const t=new Map;for(let e=0;e<50;e+=1)t.set(Object.getOwnPropertySymbols(n)[0],{});return 1===t.size};var t=e=>{if(n(e)){const e=new Map;return{u:r=>e.get(r),i:(r,n)=>{e.set(r,n)},_:(r,n)=>{n=n||0;let t=0;return e.forEach(e=>{t>=n&&r(e),t+=1}),t}}}const r=[],t=[];return{u:e=>{for(let n=0;n<r.length;n+=1)if(r[n]===e)return t[n]},i:(e,n)=>{r.push(e),t.push(n)},_:(e,r)=>{let n;for(n=r||0;n<t.length;n+=1)e(t[n]);return n}}},o=(e,r)=>{const n=[],t={};Array.prototype.forEach.call(e,(e,r)=>{t[String(r)]=1,n.push(r)});let o=Object.keys(e).filter(e=>!t[e]);r&&"function"==typeof Symbol&&(o=o.concat(Object.getOwnPropertySymbols(e).filter(e=>Symbol[String(e).slice(14,-1)]!==e)));let a=0;return n.concat(o).reduce((r,n)=>(n===a?(a+=1,r.l.push(e[n])):(r.s.push(n),r.p.push(e[n])),r),{l:[],s:[],p:[]})},a=e=>({m:e.slice(0,2),g:Number(e.slice(2))}),u=(e,r)=>{if(e.S[r])return e.S[r].A;const n=a(r);return e.S[n.m]?e.N[r].R:r},c=(e,r)=>{for(let n=0;n<r.h[0].length;n+=1)r.R[n]=u(e,r.h[0][n])},i=(e,r,n,t)=>{for(let o=0;o<(r.h[n]||[]).length;o+=1){const a=r.h[n][o];if("Sy"===a.slice(0,2)&&"function"!=typeof Symbol&&e.V)return;r.R[u(e,a)]=u(e,r.h[t][o])}},f=(e,r)=>{if(e.S[r])return e.S[r].A;const n=a(r);return e.S[n.m].M(e,e.B[n.m][n.g])},_=(e,r)=>0===r.s.length?e:e.concat([r.s,r.p]);const y=r=>({F:e(new r),O:(e,r)=>_([Array.prototype.slice.call(new Uint8Array(e))],r),M:(e,n)=>{const t=n[0],o=new r(t.length),a=new Uint8Array(o);return t.forEach((r,n)=>{a[n]=f(e,r)}),o},U:(e,r)=>{c(e,r),i(e,r,1,2)}});var l=e=>("function"==typeof ArrayBuffer&&(e.AB=y(ArrayBuffer)),"function"==typeof SharedArrayBuffer&&(e.Sh=y(SharedArrayBuffer)),e),s=e=>(e.Ar={F:"Array",O:(e,r)=>_([r.l],r),M:()=>[],U:(e,r)=>{c(e,r),i(e,r,1,2)}},e.rg={F:"Arguments",O:(e,r)=>_([r.l],r),M:(e,r)=>(function(){return arguments}).apply(null,Array(r[0].length)),U:(e,r)=>{c(e,r),i(e,r,1,2)}},e),d=r=>({F:e(r("")),I:1,O:e=>String(e),M:(e,n)=>r(n),U:()=>{}}),p=e=>(e.St=d(String),e.Nu=d(Number),e),m=e=>("function"==typeof BigInt&&(e.Bi=d(BigInt)),e);const b=(e,r,n)=>({F:e,O:(e,n)=>_([[void 0].concat(r.map(r=>e[r]))],n),j:(e,r,n,t)=>{const o=new FileReader;o.addEventListener("loadend",()=>{r[0][0]=n(new Uint8Array(o.result)),t()}),o.readAsArrayBuffer(e)},M:(e,r)=>{const t=a(r[0][0]),o="un"===t.m?[]:e.B[t.m][t.g][0];return n(e,[new Uint8Array(o.map(r=>f(e,r)))],r[0])},U:(e,r)=>{i(e,r,1,2)}});var w=e=>("function"==typeof Blob&&(e.Bl=b("Blob",["type"],(e,r,n)=>new Blob(r,{type:f(e,n[1])}))),"function"==typeof File&&(e.Fi=b("File",["type","name","lastModified"],(e,r,n)=>{try{return new File(r,f(e,n[2]),{type:f(e,n[1]),lastModified:f(e,n[3])})}catch(t){if(e.V){const t=new Blob(r,{type:f(e,n[1])});return t.name=f(e,n[2]),t.lastModified=f(e,n[3]),t}throw t}})),e),g=e=>(e.Da={F:"Date",O:(e,r)=>_([[e.valueOf()]],r),M:(e,r)=>new Date(f(e,r[0][0])),U:(e,r)=>{i(e,r,1,2)}},e);const S={EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};var v=e=>(e.Er={F:"Error",O:(e,r)=>_([[S[e.name]?e.name:"Error",e.message,e.stack]],r),M:(e,r)=>{const n=r[0],t=new(S[f(e,n[0])]||Error)(f(e,n[1]));return t.stack=f(e,n[2]),t},U:(e,r)=>{i(e,r,1,2)}},e),A=e=>("function"==typeof Set&&(e.Se={F:"Set",O:(e,r)=>{const n=[];return e.forEach(e=>{n.push(e)}),_([n],r)},M:()=>new Set,U:(e,r)=>{r.h[0].forEach(n=>{r.R.add(u(e,n))}),i(e,r,1,2)}},e.Ma={F:"Map",$:1,O:(e,r)=>{const n=[],t=[];return e.forEach((e,r)=>{n.push(r),t.push(e)}),_([n,t],r)},M:()=>new Map,U:(e,r)=>{for(let n=0;n<r.h[0].length;n+=1)r.R.set(u(e,r.h[0][n]),u(e,r.h[1][n]));i(e,r,2,3)}}),e),E=e=>(e.Ob={F:"Object",O:(e,r)=>_([],r),M:()=>({}),U:(e,r)=>{i(e,r,0,1)}},e);const R=e=>void 0===e.flags?e.options:e.flags;var N=e=>(e.Re={F:"RegExp",O:(e,r)=>_([[e.source,R(e),e.lastIndex]],r),M:(e,r)=>{const n=r[0],t=new RegExp(f(e,n[0]),f(e,n[1]));return t.lastIndex=f(e,n[2]),t},U:(e,r)=>{i(e,r,1,2)}},e),h=e=>(e.un={A:void 0},e.nl={A:null},e.tr={A:!0},e.fa={A:!1},e.pI={A:1/0},e.nI={A:-1/0},e.Na={A:NaN},e.n0={A:-0},e),V=e=>("function"==typeof Symbol&&(e.Sy={F:"Symbol",I:1,O:e=>{const r=Symbol.keyFor(e);return void 0!==r?`R${r}`:` ${String(e).slice(7,-1)}`},M:(e,r)=>"R"===r[0]?Symbol.for(r.slice(1)):Symbol(r.slice(1)),U:()=>{}}),e);const M=r=>({F:e(new r),O:(e,r)=>_([r.l],r),M:(e,n)=>new r(n[0].length),U:(e,r)=>{c(e,r),i(e,r,1,2)}});var B=e=>("function"==typeof Int8Array&&(e.I1=M(Int8Array),e.I2=M(Int16Array),e.I3=M(Int32Array),e.U1=M(Uint8Array),e.U2=M(Uint16Array),e.U3=M(Uint32Array),e.F3=M(Float32Array)),"function"==typeof Uint8ClampedArray&&(e.C1=M(Uint8ClampedArray)),"function"==typeof Float64Array&&(e.F4=M(Float64Array)),e);const F=r=>({F:`_${e(new r(""))}`,O:(e,r)=>_([[e.valueOf()]],r),M:(e,n)=>new r(f(e,n[0][0])),U:(e,r)=>{i(e,r,1,2)}});var O=e=>(e.Bo=F(Boolean),e.NU=F(Number),e.ST=F(String),e);let U={};var I=U=m(U=w(U=l(U=B(U=A(U=V(U=v(U=N(U=g(U=E(U=s(U=O(U=p(U=h(U))))))))))))));const j=(n,t)=>{const o=r(n,t);if(!o&&!n.V){const r=e(t);throw new Error(`Cannot encode unsupported type "${r}".`)}return o||"Ob"},x=(e,r)=>{const n=j(e,r);if(!e.S[n].U)return n;const t=e.C.u(r,n);if(void 0!==t)return t.k;e.T[n]=e.T[n]||[],e.T[n].push(0);const o=e.T[n].length-1,a={m:n,g:o,k:n+o,R:r};return e.C.i(r,a),e.S[n].j&&e.D.push(a),a.k},$=(r,n)=>r.C._(n=>{let t=[];I[n.m].I||(t=o(n.R,r.J));let a=I[n.m].O(n.R,t);"String"!==e(a)&&(a=a.map(e=>e.map(e=>x(r,e)))),r.T[n.m][n.g]=a},n),C=(e,r)=>{e.T.r=r,e.T.v="1.0.0";const n=JSON.stringify(Object.keys(e.T).map(r=>[r,e.T[r]]));if("function"!=typeof e.q)return n;e.q(n)};var k=(e,r)=>{r=r||{};let n={},o={};Object.keys(I).forEach(e=>{const r=I[e].F;r&&(n[r]=e),"_"===(r||"")[0]&&(o[r.slice(1)]=r)});const a={V:r.compat,J:r.encodeSymbolKeys,q:r.onFinish,S:I,o:n,t:o,C:t(r.encodeSymbolKeys),D:[],T:{}},u=x(a,e),c=$(a);if(!(a.D.length>0))return C(a,u);{if("function"!=typeof r.onFinish){if(a.V)return C(a,u);throw new Error("Deferred Types require onFinish option.")}let e=a.D.length;const n=()=>{if(0===(e-=1))return $(a,c),C(a,u)};a.D.forEach(e=>{I[e.m].j(e.R,a.T[e.m][e.g],e=>x(a,e),n)})}};const T=(r,n)=>{"Array"===e(n)?n.forEach(e=>{T(r,e)}):r.K.push(n)},z=(r,n)=>{const t=a(n);if(!I[t.m]){if(r.V)return;throw new Error(`Cannot decode unrecognized pointer type "${t.m}".`)}if(!I[n]&&void 0===r.N[n]){r.N[n]={m:t.m,g:t.g,k:n,R:void 0,h:r.B[t.m][t.g]};try{r.N[n].R=I[t.m].M(r,r.B[t.m][t.g])}catch(e){if(!r.V)throw new Error(`Cannot decode recognized pointer type "${t.m}".`)}"Array"===e(r.N[n].h)&&T(r,r.N[n].h)}};var D=(e,r)=>{const n={V:(r=r||{}).compat,S:I,B:JSON.parse(e).reduce((e,r)=>(e[r[0]]=r[1],e),{}),N:{},K:[]},t=n.B.r;if(I[t])return I[t].A;const o=a(t);if(!I[o.m]){if(n.V)return t;throw new Error(`Cannot decode unrecognized pointer type "${o.m}".`)}for(n.K.push(t);n.K.length;)z(n,n.K.shift());return Object.keys(n.N).forEach(e=>{const r=n.N[e];I[r.m].U(n,r)}),n.N[t].R},J={encode:k,decode:D};
        return J;
    })();

    return {
        ...library,
        _isInFamily: (version) => {
            return version === '1.0.0' || version === '1.0.1' || version === '1.0.2';
        },
    };
})();

const v2 = (() => {
    // json-complete 2.0.0 esm version, minified
    /* istanbul ignore next */
    const library = (() => {
        var e="0123456789abcdefghijklmnopqrstuvwxyz!#%&'()*+-./:;<=>?@[]^_`{|}~",r=e=>e.split(/([A-Z$]+)/),n=e=>{const n=r(e);return{t:n[1],o:Number(n[2])}},t=" 1234567890.-e+,",o=(e,r)=>{let n="";const t=r.length;do{n=r[e%t]+n,e=Math.floor(e/t)}while(e);return n},c=(r,c,i)=>{if(!i[r]||0===i[r].i)return c;if(1===i[r].i){const r=c.join(",").replace(/E/g,"e").split("");let n=0;const i=[];for(let c=0;c<r.length;c+=1){const a=t.indexOf(r[c]);c%3==0?n=a<<2:c%3==1?(n|=a>>>2,i.push(o(n,e)),n=(3&a)<<4):(n|=a,i.push(o(n,e)))}return r.length%3!=0&&i.push(o(n,e)),i.join("")}return c.map(r=>r.map(r=>r.map(r=>{const t=n(r);return t.t+o(t.o,e)}).join("")).join(" ")).join(",")},i=e=>Object.prototype.toString.call(e).slice(8,-1),a=(e,r)=>{for(let n=0;n<e.s.length;n+=1)if(e.s[n][0](r))return e.s[n][1];if("function"==typeof Set&&r instanceof Set)return"U";if("function"==typeof Map&&r instanceof Map)return"V";let n=i(r);const t=e.u[n];return t&&"object"==typeof r&&(n=t),e._[n]};const s=e=>{if("function"!=typeof Map||"Map"!==i(new Map))return!1;if("function"!=typeof Symbol||"Symbol"!==i(Symbol())||!e)return!0;const r={};r[Symbol()]=1;const n=new Map;for(let e=0;e<50;e+=1)n.set(Object.getOwnPropertySymbols(r)[0],{});return 1===n.size};var u=e=>{if(s(e)){const e=new Map;return{p:r=>e.get(r),l:(r,n)=>{e.set(r,n)},m:(r,n)=>{n=n||0;let t=0;return e.forEach(e=>{t>=n&&r(e),t+=1}),t}}}const r=[],n=[];return{p:e=>{for(let t=0;t<r.length;t+=1)if(r[t]===e)return n[t]},l:(e,t)=>{r.push(e),n.push(t)},m:(e,r)=>{let t;for(t=r||0;t<n.length;t+=1)e(n[t]);return t}}},y=(e,r)=>{const n=[],t={};Array.prototype.forEach.call(e,(e,r)=>{t[String(r)]=1,n.push(r)});let o=Object.keys(e).filter(e=>!t[e]);r&&"function"==typeof Symbol&&(o=o.concat(Object.getOwnPropertySymbols(e).filter(e=>Symbol[String(e).slice(14,-1)]!==e)));let c=0;return n.concat(o).reduce((r,n)=>(n===c?(c+=1,r.g.push(e[n])):(r.v.push(n),r.h.push(e[n])),r),{g:[],v:[],h:[]})},f=(e,r)=>{if(e.T[r])return e.T[r].M;const t=n(r);return e.T[t.t]?e.j[r].F:r},_=(e,r)=>{for(let n=0;n<r.$[0].length;n+=1)r.F[n]=f(e,r.$[0][n])},p=(e,r,t,o)=>{for(let c=0;c<(r.$[t]||[]).length;c+=1){const i=r.$[t][c];e.C&&"function"!=typeof Symbol&&"P"===n(i).t||(r.F[f(e,i)]=f(e,r.$[o][c]))}},l=(e,r)=>{if(e.T[r])return e.T[r].M;const t=n(r);return e.T[t.t].k(e,e.q[t.t][t.o])},d=(e,r)=>0===r.v.length?e:e.concat([r.v,r.h]);const m=e=>({J:i(new e),i:2,K:(e,r)=>d([Array.prototype.slice.call(new Uint8Array(e))],r),k:(r,n)=>{const t=n[0],o=new e(t.length),c=new Uint8Array(o);return t.forEach((e,n)=>{c[n]=l(r,e)}),o},L:(e,r)=>{_(e,r),p(e,r,1,2)}});var b=e=>("function"==typeof ArrayBuffer&&(e.W=m(ArrayBuffer)),"function"==typeof SharedArrayBuffer&&(e.X=m(SharedArrayBuffer)),e),g=e=>(e.A={J:"Array",i:2,K:(e,r)=>d([r.g],r),k:()=>[],L:(e,r)=>{_(e,r),p(e,r,1,2)}},e.Q={J:"Arguments",i:2,K:(e,r)=>d([r.g],r),k:(e,r)=>(function(){return arguments}).apply(null,Array(r[0].length)),L:(e,r)=>{_(e,r),p(e,r,1,2)}},e),A=(e,r)=>({J:i(e("")),i:r||0,ee:1,K:e=>String(e),k:(r,n)=>e(n),L:()=>{}}),w=e=>(e.S=A(String),e.N=A(Number,1),e),S=e=>({J:i(new e),i:2,K:(e,r)=>d([r.g],r),k:(r,n)=>new e(n[0].length),L:(e,r)=>{_(e,r),p(e,r,1,2)}}),E=e=>("function"==typeof BigInt&&(e.I=A(BigInt,1)),"function"==typeof BigInt64Array&&(e.BI=S(BigInt64Array)),"function"==typeof BigUint64Array&&(e.BU=S(BigUint64Array)),e);const v=(e,r,t)=>({J:e,i:2,K:(e,n)=>d([[void 0].concat(r.map(r=>e[r]))],n),re:(e,r,n,t)=>{const o=new FileReader;o.addEventListener("loadend",()=>{r[0][0]=n(new Uint8Array(o.result)),t()}),o.readAsArrayBuffer(e)},k:(e,r)=>{const o=n(r[0][0]),c="K"===o.t?[]:e.q[o.t][o.o][0];return t(e,[new Uint8Array(c.map(r=>l(e,r)))],r[0])},L:(e,r)=>{p(e,r,1,2)}});var R=e=>("function"==typeof Blob&&(e.Y=v("Blob",["type"],(e,r,n)=>new Blob(r,{type:l(e,n[1])})),e.Z=v("File",["type","name","lastModified"],(e,r,n)=>{try{return new File(r,l(e,n[2]),{type:l(e,n[1]),lastModified:l(e,n[3])})}catch(t){if(e.C){const t=new Blob(r,{type:l(e,n[1])});return t.name=l(e,n[2]),t.lastModified=l(e,n[3]),t}throw t}})),e),N=e=>(e.D={J:"Date",i:2,K:(e,r)=>d([[e.valueOf()]],r),k:(e,r)=>new Date(l(e,r[0][0])),L:(e,r)=>{p(e,r,1,2)}},e);const h={EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};var T=e=>(e.E={J:"Error",i:2,K:(e,r)=>d([[h[e.name]?e.name:"Error",e.message,e.stack]],r),k:(e,r)=>{const n=r[0],t=new(h[l(e,n[0])]||Error)(l(e,n[1]));return t.stack=l(e,n[2]),t},L:(e,r)=>{p(e,r,1,2)}},e),U=e=>("function"==typeof Set&&(e.U={J:"Set",i:2,K:(e,r)=>{const n=[];return e.forEach(e=>{n.push(e)}),d([n],r)},k:()=>new Set,L:(e,r)=>{r.$[0].forEach(n=>{r.F.add(f(e,n))}),p(e,r,1,2)}}),"function"==typeof Map&&(e.V={J:"Map",i:2,K:(e,r)=>{const n=[],t=[];return e.forEach((e,r)=>{n.push(r),t.push(e)}),d([n,t],r)},k:()=>new Map,L:(e,r)=>{for(let n=0;n<r.$[0].length;n+=1)r.F.set(f(e,r.$[0][n]),f(e,r.$[1][n]));p(e,r,2,3)}}),e),B=e=>(e.O={J:"Object",i:2,K:(e,r)=>d([],r),k:()=>({}),L:(e,r)=>{p(e,r,0,1)}},e);const M=e=>{try{const r=new RegExp(" ",e);return"RegExp"===i(r)}catch(e){return!1}},V=M("y"),x=M("u");var I=e=>(e.R={J:"RegExp",i:2,K:(e,r)=>{let n=e.flags;return void 0===n&&(n=e.options),d([[e.source,n,e.lastIndex]],r)},k:(e,r)=>{const n=r[0];let t=l(e,n[1]);e.C&&(V||(t=t.replace(/y/g,"")),x||(t=t.replace(/u/g,"")));const o=new RegExp(l(e,n[0]),t);return o.lastIndex=l(e,n[2]),o},L:(e,r)=>{p(e,r,1,2)}},e);const F=e=>({ne:r=>e===r,M:e});var O=e=>(e.$0=F(void 0),e.$1=F(null),e.$2=F(!0),e.$3=F(!1),e.$4=F(1/0),e.$5=F(-1/0),e.$6={ne:e=>e!=e,M:NaN},e.$7={ne:e=>0===e&&1/e==-1/0,M:-0},e),j=e=>("function"==typeof Symbol&&(e.P={J:"Symbol",i:0,ee:1,K:e=>{const r=Symbol.keyFor(e);return void 0!==r?`r${r}`:`s${String(e).slice(7,-1)}`},k:(e,r)=>"r"===r[0]?Symbol.for(r.slice(1)):Symbol(r.slice(1)),L:()=>{}}),e),$=e=>("function"==typeof Int8Array&&(e.IE=S(Int8Array)),"function"==typeof Int16Array&&(e.IS=S(Int16Array)),"function"==typeof Int32Array&&(e.IT=S(Int32Array)),"function"==typeof Uint8Array&&(e.UE=S(Uint8Array)),"function"==typeof Uint8ClampedArray&&(e.UC=S(Uint8ClampedArray)),"function"==typeof Uint16Array&&(e.US=S(Uint16Array)),"function"==typeof Uint32Array&&(e.UT=S(Uint32Array)),"function"==typeof Float32Array&&(e.FT=S(Float32Array)),"function"==typeof Float64Array&&(e.FS=S(Float64Array)),e);const C=e=>({J:`_${i(new e(""))}`,i:2,K:(e,r)=>d([[e.valueOf()]],r),k:(r,n)=>new e(l(r,n[0][0])),L:(e,r)=>{p(e,r,1,2)}});var k=e=>(e.B=C(Boolean),e.G=C(String),e.H=C(Number),e);let z={};var D=z=E(z=R(z=b(z=$(z=U(z=j(z=T(z=I(z=N(z=B(z=g(z=k(z=w(z=O(z))))))))))))));const q=(e,r)=>{const n=a(e,r);if(!n&&!e.C){const e=i(r);throw new Error(`Cannot encode unsupported type "${e}".`)}return n||"O"},J=(e,r)=>{const n=q(e,r);if(!e.T[n].L)return n;const t=e.te.p(r,n);if(void 0!==t)return t.oe;e.ce[n]=e.ce[n]||[],e.ce[n].push(0);const o=e.ce[n].length-1,c={t:n,o:o,oe:n+o,F:r};return e.te.l(r,c),e.T[n].re&&e.ie.push(c),c.oe},K=(e,r)=>e.te.m(r=>{let n=[];D[r.t].ee||(n=y(r.F,e.ae));let t=D[r.t].K(r.F,n);"String"!==i(t)&&(t=t.map(r=>r.map(r=>J(e,r)))),e.ce[r.t][r.o]=t},r),P=(e,r)=>{const n=JSON.stringify([`${r},2`].concat(Object.keys(e.ce).map(r=>[r,c(r,e.ce[r],e.T)])));if("function"!=typeof e.se)return n;e.se(n)};var Z=(e,r)=>{r=r||{};let n=[],t={},o={};Object.keys(D).forEach(e=>{if("$"===e[0])return void n.push([D[e].ne,e]);const r=D[e].J;t[r]=e,"_"===r[0]&&(o[r.slice(1)]=r)});const c={C:r.compat,ae:r.encodeSymbolKeys,se:r.onFinish,s:n,T:D,_:t,u:o,te:u(r.encodeSymbolKeys),ie:[],ce:{}},i=J(c,e),a=K(c);if(!(c.ie.length>0))return P(c,i);{if("function"!=typeof r.onFinish){if(c.C)return P(c,i);throw new Error("Deferred Types require onFinish option.")}let e=c.ie.length;const n=()=>{if(0===(e-=1))return K(c,a),P(c,i)};c.ie.forEach(e=>{D[e.t].re(e.F,c.ce[e.t][e.o],e=>J(c,e),n)})}},G=(e,r)=>{const n=r.length;return e.split("").reduce((e,t)=>e*n+r.indexOf(t),0)},H=(n,o,c)=>{if(!c[n]||0===c[n].i)return o;if(1===c[n].i){let r=[];const n=o.length;for(let c=0;c<n-1;c+=2)r=r.concat([t[(60&G(o[c],e))>>>2],t[(3&G(o[c],e))<<2|(48&G(o[c+1],e))>>4],t[15&G(o[c+1],e)]]);return n%2!=0&&(r=r.concat([t[G(o[n-1],e)>>>2]])),r.length&&" "===r[r.length-1]&&(r=r.slice(0,-1)),r.join("").split(",")}return o.split(",").map(n=>n.split(" ").map(n=>{const t=r(n).slice(1),o=[];for(let r=0;r<t.length;r+=2)o.push(t[r]+G(t[r+1],e));return o}))};const L=(e,r)=>{"Array"===i(r)?r.forEach(r=>{L(e,r)}):e.ue.push(r)},Q=(e,r)=>{if(D[r]||void 0!==e.j[r])return;const t=n(r);if(!D[t.t]){if(e.C)return;throw new Error(`Cannot decode unrecognized pointer type "${t.t}".`)}e.j[r]={t:t.t,o:t.o,oe:r,F:void 0,$:e.q[t.t][t.o]};try{e.j[r].F=D[t.t].k(e,e.q[t.t][t.o])}catch(r){if(!e.C)throw new Error(`Cannot decode recognized pointer type "${t.t}".`)}"Array"===i(e.j[r].$)&&L(e,e.j[r].$)};var W=(e,r)=>{r=r||{};const t=JSON.parse(e),o=t.slice(1).reduce((e,r)=>(e[r[0]]=H(r[0],r[1],D),e),{}),c=t[0].split(",")[0],i={C:r.compat,T:D,q:o,j:{},ue:[]};if(D[c])return D[c].M;const a=n(c);if(!D[a.t]){if(i.C)return c;throw new Error(`Cannot decode unrecognized pointer type "${a.t}".`)}for(i.ue.push(c);i.ue.length;)Q(i,i.ue.shift());return Object.keys(i.j).forEach(e=>{const r=i.j[e];D[r.t].L(i,r)}),i.j[c].F},X={encode:Z,decode:W};
        return X;
    })();

    return {
        ...library,
        _isInFamily: (version) => {
            return version === '2';
        },
    };
})();

const convertableVersions = [
    '1.0.0',
    '2',
];

const determineVersion = (encoded) => {
    // Could throw if invalid JSON
    const data = JSON.parse(encoded);

    if (getSystemName(data) !== 'Array') {
        throw new Error('Encoded data is not in Array form. Cannot determine version of encoded json-complete data.');
    }

    if (getSystemName(data[0]) === 'String' && (/,2$/).test(data[0])) {
        return '2';
    }

    // Array.prototype.find not supported in IE
    let versionItem = void 0;
    data.forEach((item) => {
        if (getSystemName(item) === 'Array' && item[0] === 'v') {
            versionItem = item;
        }
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

    return v1.decode(encoded);
};

const recompress = (data, version) => {
    if (v2._isInFamily(version)) {
        return v2.encode(data);
    }

    return v1.encode(data);
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
