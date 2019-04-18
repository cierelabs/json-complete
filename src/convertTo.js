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
        var e=e=>e.split(/([A-Z$_]+)/),r=r=>{const n=e(r);return{t:n[1],o:Number(n[2])}},n="0123456789abcdefghijklmnopqrstuvwxyz!#%&'()*+-./:;<=>?@[]^`{|}~";const t=n.length;var o=e=>{let r="";do{r=n[e%t]+r,e=Math.floor(e/t)}while(e);return r},c=(e,n,t)=>t[e]&&0!==t[e].i?1===t[e].i?n.join(","):n.map(e=>e.map(e=>e.map(e=>{const n=r(e);return n.t+o(n.o)}).join("")).join(" ")).join(","):n,a=e=>Object.prototype.toString.call(e).slice(8,-1),i=(e,r)=>{if(void 0===r)return"K";if(null===r)return"L";if(!0===r)return"T";if(!1===r)return"F";if("number"==typeof r){if(r===1/0)return"I";if(r===-1/0)return"J";if(r!=r)return"C";if(0===r&&1/r==-1/0)return"M"}if("function"==typeof Set&&r instanceof Set)return"U";if("function"==typeof Map&&r instanceof Map)return"V";let n=a(r);const t=e.u[n];return t&&"object"==typeof r&&(n=t),e.s[n]};const u=e=>{if("function"!=typeof Map||"Map"!==a(new Map))return!1;if("function"!=typeof Symbol||"Symbol"!==a(Symbol())||!e)return!0;const r={};r[Symbol()]=1;const n=new Map;for(let e=0;e<50;e+=1)n.set(Object.getOwnPropertySymbols(r)[0],{});return 1===n.size};var y=e=>{if(u(e)){const e=new Map;return{p:r=>e.get(r),l:(r,n)=>{e.set(r,n)},m:(r,n)=>{n=n||0;let t=0;return e.forEach(e=>{t>=n&&r(e),t+=1}),t}}}const r=[],n=[];return{p:e=>{for(let t=0;t<r.length;t+=1)if(r[t]===e)return n[t]},l:(e,t)=>{r.push(e),n.push(t)},m:(e,r)=>{let t;for(t=r||0;t<n.length;t+=1)e(n[t]);return t}}},f=(e,r)=>{const n=[],t={};Array.prototype.forEach.call(e,(e,r)=>{t[String(r)]=1,n.push(r)});let o=Object.keys(e).filter(e=>!t[e]);r&&"function"==typeof Symbol&&(o=o.concat(Object.getOwnPropertySymbols(e).filter(e=>Symbol[String(e).slice(14,-1)]!==e)));let c=0;return n.concat(o).reduce((r,n)=>(n===c?(c+=1,r.g.push(e[n])):(r.v.push(n),r.h.push(e[n])),r),{g:[],v:[],h:[]})},s=(e,n)=>{if(e.j[n])return e.j[n].k;const t=r(n);return e.j[t.t]?e.ee[n].q:n},_=(e,r)=>{for(let n=0;n<r.re[0].length;n+=1)r.q[n]=s(e,r.re[0][n])},p=(e,n,t,o)=>{for(let c=0;c<(n.re[t]||[]).length;c+=1){const a=n.re[t][c];e.ne&&"function"!=typeof Symbol&&"P"===r(a).t||(n.q[s(e,a)]=s(e,n.re[o][c]))}},l=(e,n)=>{if(e.j[n])return e.j[n].k;const t=r(n);return e.j[t.t].te(e,e.oe[t.t][t.o])},d=(e,r)=>0===r.v.length?e:e.concat([r.v,r.h]);const m=e=>({ce:a(new e),i:2,ae:(e,r)=>d([Array.prototype.slice.call(new Uint8Array(e))],r),te:(r,n)=>{const t=n[0],o=new e(t.length),c=new Uint8Array(o);return t.forEach((e,n)=>{c[n]=l(r,e)}),o},ie:(e,r)=>{_(e,r),p(e,r,1,2)}});var b=e=>("function"==typeof ArrayBuffer&&(e.W=m(ArrayBuffer)),"function"==typeof SharedArrayBuffer&&(e.X=m(SharedArrayBuffer)),e),g=e=>(e.A={ce:"Array",i:2,ae:(e,r)=>d([r.g],r),te:()=>[],ie:(e,r)=>{_(e,r),p(e,r,1,2)}},e.Q={ce:"Arguments",i:2,ae:(e,r)=>d([r.g],r),te:(e,r)=>(function(){return arguments}).apply(null,Array(r[0].length)),ie:(e,r)=>{_(e,r),p(e,r,1,2)}},e),A=(e,r)=>({ce:a(e("")),i:r||0,ue:1,ae:e=>String(e),te:(r,n)=>e(n),ie:()=>{}}),w=e=>(e.S=A(String),e.N=A(Number,1),e),v=e=>({ce:a(new e),i:2,ae:(e,r)=>d([r.g],r),te:(r,n)=>new e(n[0].length),ie:(e,r)=>{_(e,r),p(e,r,1,2)}}),S=e=>("function"==typeof BigInt&&(e._=A(BigInt,1)),"function"==typeof BigInt64Array&&(e.BI=v(BigInt64Array)),"function"==typeof BigUint64Array&&(e.BU=v(BigUint64Array)),e);const E=(e,n,t)=>({ce:e,i:2,ae:(e,r)=>d([[void 0].concat(n.map(r=>e[r]))],r),ye:(e,r,n,t)=>{const o=new FileReader;o.addEventListener("loadend",()=>{r[0][0]=n(new Uint8Array(o.result)),t()}),o.readAsArrayBuffer(e)},te:(e,n)=>{const o=r(n[0][0]),c="K"===o.t?[]:e.oe[o.t][o.o][0];return t(e,[new Uint8Array(c.map(r=>l(e,r)))],n[0])},ie:(e,r)=>{p(e,r,1,2)}});var R=e=>("function"==typeof Blob&&(e.Y=E("Blob",["type"],(e,r,n)=>new Blob(r,{type:l(e,n[1])})),e.Z=E("File",["type","name","lastModified"],(e,r,n)=>{try{return new File(r,l(e,n[2]),{type:l(e,n[1]),lastModified:l(e,n[3])})}catch(t){if(e.ne){const t=new Blob(r,{type:l(e,n[1])});return t.name=l(e,n[2]),t.lastModified=l(e,n[3]),t}throw t}})),e),N=e=>(e.D={ce:"Date",i:2,ae:(e,r)=>d([[e.valueOf()]],r),te:(e,r)=>new Date(l(e,r[0][0])),ie:(e,r)=>{p(e,r,1,2)}},e);const h={EvalError:EvalError,RangeError:RangeError,ReferenceError:ReferenceError,SyntaxError:SyntaxError,TypeError:TypeError,URIError:URIError};var T=e=>(e.E={ce:"Error",i:2,ae:(e,r)=>d([[h[e.name]?e.name:"Error",e.message,e.stack]],r),te:(e,r)=>{const n=r[0],t=new(h[l(e,n[0])]||Error)(l(e,n[1]));return t.stack=l(e,n[2]),t},ie:(e,r)=>{p(e,r,1,2)}},e),U=e=>("function"==typeof Set&&(e.U={ce:"Set",i:2,ae:(e,r)=>{const n=[];return e.forEach(e=>{n.push(e)}),d([n],r)},te:()=>new Set,ie:(e,r)=>{r.re[0].forEach(n=>{r.q.add(s(e,n))}),p(e,r,1,2)}}),"function"==typeof Map&&(e.V={ce:"Map",i:2,ae:(e,r)=>{const n=[],t=[];return e.forEach((e,r)=>{n.push(r),t.push(e)}),d([n,t],r)},te:()=>new Map,ie:(e,r)=>{for(let n=0;n<r.re[0].length;n+=1)r.q.set(s(e,r.re[0][n]),s(e,r.re[1][n]));p(e,r,2,3)}}),e),M=e=>(e.O={ce:"Object",i:2,ae:(e,r)=>d([],r),te:()=>({}),ie:(e,r)=>{p(e,r,0,1)}},e);const B=e=>{try{const r=new RegExp(" ",e);return"RegExp"===a(r)}catch(e){return!1}},V=B("y"),I=B("u");var x=e=>(e.R={ce:"RegExp",i:2,ae:(e,r)=>{let n=e.flags;return void 0===n&&(n=e.options),d([[e.source,n,e.lastIndex]],r)},te:(e,r)=>{const n=r[0];let t=l(e,n[1]);e.ne&&(V||(t=t.replace(/y/g,"")),I||(t=t.replace(/u/g,"")));const o=new RegExp(l(e,n[0]),t);return o.lastIndex=l(e,n[2]),o},ie:(e,r)=>{p(e,r,1,2)}},e),F=e=>(e.K={k:void 0},e.L={k:null},e.T={k:!0},e.F={k:!1},e.I={k:1/0},e.J={k:-1/0},e.C={k:NaN},e.M={k:-0},e),O=e=>("function"==typeof Symbol&&(e.P={ce:"Symbol",i:0,ue:1,ae:e=>{const r=Symbol.keyFor(e);return void 0!==r?`r${r}`:`s${String(e).slice(7,-1)}`},te:(e,r)=>"r"===r[0]?Symbol.for(r.slice(1)):Symbol(r.slice(1)),ie:()=>{}}),e),j=e=>("function"==typeof Int8Array&&(e.IE=v(Int8Array)),"function"==typeof Int16Array&&(e.IS=v(Int16Array)),"function"==typeof Int32Array&&(e.IT=v(Int32Array)),"function"==typeof Uint8Array&&(e.$=v(Uint8Array)),"function"==typeof Uint8ClampedArray&&(e.UC=v(Uint8ClampedArray)),"function"==typeof Uint16Array&&(e.US=v(Uint16Array)),"function"==typeof Uint32Array&&(e.UT=v(Uint32Array)),"function"==typeof Float32Array&&(e.FT=v(Float32Array)),"function"==typeof Float64Array&&(e.FS=v(Float64Array)),e);const $=e=>({ce:`_${a(new e(""))}`,i:2,ae:(e,r)=>d([[e.valueOf()]],r),te:(r,n)=>new e(l(r,n[0][0])),ie:(e,r)=>{p(e,r,1,2)}});var C=e=>(e.B=$(Boolean),e.G=$(String),e.H=$(Number),e);let k={};var z=k=S(k=R(k=b(k=j(k=U(k=O(k=T(k=x(k=N(k=M(k=g(k=C(k=w(k=F(k))))))))))))));const D=(e,r)=>{const n=i(e,r);if(!n&&!e.ne){const e=a(r);throw new Error(`Cannot encode unsupported type "${e}".`)}return n||"O"},J=(e,r)=>{const n=D(e,r);if(!e.j[n].ie)return n;const t=e.fe.p(r,n);if(void 0!==t)return t.se;e._e[n]=e._e[n]||[],e._e[n].push(0);const o=e._e[n].length-1,c={t:n,o:o,se:n+o,q:r};return e.fe.l(r,c),e.j[n].ye&&e.pe.push(c),c.se},K=(e,r)=>e.fe.m(r=>{let n=[];z[r.t].ue||(n=f(r.q,e.le));let t=z[r.t].ae(r.q,n);"String"!==a(t)&&(t=t.map(r=>r.map(r=>J(e,r)))),e._e[r.t][r.o]=t},r),q=(e,r)=>{const n=JSON.stringify([r,"2"].concat(Object.keys(e._e).map(r=>[r,c(r,e._e[r],e.j)])));if("function"!=typeof e.de)return n;e.de(n)};var L=(e,r)=>{r=r||{};let n={},t={};Object.keys(z).forEach(e=>{const r=z[e].ce;r&&(n[r]=e),"_"===(r||"")[0]&&(t[r.slice(1)]=r)});const o={ne:r.compat,le:r.encodeSymbolKeys,de:r.onFinish,j:z,s:n,u:t,fe:y(r.encodeSymbolKeys),pe:[],_e:{}},c=J(o,e),a=K(o);if(!(o.pe.length>0))return q(o,c);{if("function"!=typeof r.onFinish){if(o.ne)return q(o,c);throw new Error("Deferred Types require onFinish option.")}let e=o.pe.length;const n=()=>{if(0===(e-=1))return K(o,a),q(o,c)};o.pe.forEach(e=>{z[e.t].ye(e.q,o._e[e.t][e.o],e=>J(o,e),n)})}};const P=n.length;var Z=e=>e.split("").reduce((e,r)=>e*P+n.indexOf(r),0),G=(r,n,t)=>t[r]&&0!==t[r].i?1===t[r].i?n.split(","):n.split(",").map(r=>r.split(" ").map(r=>{const n=e(r).slice(1),o=[];for(let e=0;e<n.length;e+=2){const r=n[e],c=t[r]&&!t[r].ce;o.push(c?r:r+Z(n[e+1]))}return o})):n;const H=(e,r)=>{"Array"===a(r)?r.forEach(r=>{H(e,r)}):e.me.push(r)},Q=(e,n)=>{const t=r(n);if(!z[t.t]){if(e.ne)return;throw new Error(`Cannot decode unrecognized pointer type "${t.t}".`)}if(!z[n]&&void 0===e.ee[n]){e.ee[n]={t:t.t,o:t.o,se:n,q:void 0,re:e.oe[t.t][t.o]};try{e.ee[n].q=z[t.t].te(e,e.oe[t.t][t.o])}catch(r){if(!e.ne)throw new Error(`Cannot decode recognized pointer type "${t.t}".`)}"Array"===a(e.ee[n].re)&&H(e,e.ee[n].re)}};var W=(e,n)=>{n=n||{};const t=JSON.parse(e),o=t.slice(2).reduce((e,r)=>(e[r[0]]=G(r[0],r[1],z),e),{}),c=t[0],a={ne:n.compat,j:z,oe:o,ee:{},me:[]};if(z[c])return z[c].k;const i=r(c);if(!z[i.t]){if(a.ne)return c;throw new Error(`Cannot decode unrecognized pointer type "${i.t}".`)}for(a.me.push(c);a.me.length;)Q(a,a.me.shift());return Object.keys(a.ee).forEach(e=>{const r=a.ee[e];z[r.t].ie(a,r)}),a.ee[c].q},X={encode:L,decode:W};
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

    if (getSystemName(data[0]) === 'String' && getSystemName(data[1]) === 'String' && v2._isInFamily(data[1])) {
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
