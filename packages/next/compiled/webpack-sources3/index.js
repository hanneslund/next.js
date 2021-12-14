(function(){var e={91:function(e,t,n){"use strict";const s=n(980);const r=n(706);const i=n(57);const u=n(944);const mapToBufferedMap=e=>{if(typeof e!=="object"||!e)return e;const t=Object.assign({},e);if(e.mappings){t.mappings=Buffer.from(e.mappings,"utf-8")}if(e.sourcesContent){t.sourcesContent=e.sourcesContent.map((e=>e&&Buffer.from(e,"utf-8")))}return t};const bufferedMapToMap=e=>{if(typeof e!=="object"||!e)return e;const t=Object.assign({},e);if(e.mappings){t.mappings=e.mappings.toString("utf-8")}if(e.sourcesContent){t.sourcesContent=e.sourcesContent.map((e=>e&&e.toString("utf-8")))}return t};class CachedSource extends s{constructor(e,t){super();this._source=e;this._cachedSourceType=t?t.source:undefined;this._cachedSource=undefined;this._cachedBuffer=t?t.buffer:undefined;this._cachedSize=t?t.size:undefined;this._cachedMaps=t?t.maps:new Map;this._cachedHashUpdate=t?t.hash:undefined}getCachedData(){const e=new Map;for(const t of this._cachedMaps){let n=t[1];if(n.bufferedMap===undefined){n.bufferedMap=mapToBufferedMap(this._getMapFromCacheEntry(n))}e.set(t[0],{map:undefined,bufferedMap:n.bufferedMap})}if(this._cachedSource){this.buffer()}return{buffer:this._cachedBuffer,source:this._cachedSourceType!==undefined?this._cachedSourceType:typeof this._cachedSource==="string"?true:Buffer.isBuffer(this._cachedSource)?false:undefined,size:this._cachedSize,maps:e,hash:this._cachedHashUpdate}}originalLazy(){return this._source}original(){if(typeof this._source==="function")this._source=this._source();return this._source}source(){const e=this._getCachedSource();if(e!==undefined)return e;return this._cachedSource=this.original().source()}_getMapFromCacheEntry(e){if(e.map!==undefined){return e.map}else if(e.bufferedMap!==undefined){return e.map=bufferedMapToMap(e.bufferedMap)}}_getCachedSource(){if(this._cachedSource!==undefined)return this._cachedSource;if(this._cachedBuffer&&this._cachedSourceType!==undefined){return this._cachedSource=this._cachedSourceType?this._cachedBuffer.toString("utf-8"):this._cachedBuffer}}buffer(){if(this._cachedBuffer!==undefined)return this._cachedBuffer;if(this._cachedSource!==undefined){if(Buffer.isBuffer(this._cachedSource)){return this._cachedBuffer=this._cachedSource}return this._cachedBuffer=Buffer.from(this._cachedSource,"utf-8")}if(typeof this.original().buffer==="function"){return this._cachedBuffer=this.original().buffer()}const e=this.source();if(Buffer.isBuffer(e)){return this._cachedBuffer=e}return this._cachedBuffer=Buffer.from(e,"utf-8")}size(){if(this._cachedSize!==undefined)return this._cachedSize;if(this._cachedBuffer!==undefined){return this._cachedSize=this._cachedBuffer.length}const e=this._getCachedSource();if(e!==undefined){return this._cachedSize=Buffer.byteLength(e)}return this._cachedSize=this.original().size()}sourceAndMap(e){const t=e?JSON.stringify(e):"{}";const n=this._cachedMaps.get(t);if(n!==undefined){const e=this._getMapFromCacheEntry(n);return{source:this.source(),map:e}}let s=this._getCachedSource();let r;if(s!==undefined){r=this.original().map(e)}else{const t=this.original().sourceAndMap(e);s=t.source;r=t.map;this._cachedSource=s}this._cachedMaps.set(t,{map:r,bufferedMap:undefined});return{source:s,map:r}}streamChunks(e,t,n,s){const o=e?JSON.stringify(e):"{}";if(this._cachedMaps.has(o)&&(this._cachedBuffer!==undefined||this._cachedSource!==undefined)){const{source:u,map:o}=this.sourceAndMap(e);if(o){return r(u,o,t,n,s,!!(e&&e.finalSource),true)}else{return i(u,t,n,s,!!(e&&e.finalSource))}}const{result:f,source:c,map:a}=u(this.original(),e,t,n,s);this._cachedSource=c;this._cachedMaps.set(o,{map:a,bufferedMap:undefined});return f}map(e){const t=e?JSON.stringify(e):"{}";const n=this._cachedMaps.get(t);if(n!==undefined){return this._getMapFromCacheEntry(n)}const s=this.original().map(e);this._cachedMaps.set(t,{map:s,bufferedMap:undefined});return s}updateHash(e){if(this._cachedHashUpdate!==undefined){for(const t of this._cachedHashUpdate)e.update(t);return}const t=[];let n=undefined;const s={update:e=>{if(typeof e==="string"&&e.length<10240){if(n===undefined){n=e}else{n+=e;if(n.length>102400){t.push(Buffer.from(n));n=undefined}}}else{if(n!==undefined){t.push(Buffer.from(n));n=undefined}t.push(e)}}};this.original().updateHash(s);if(n!==undefined){t.push(Buffer.from(n))}for(const n of t)e.update(n);this._cachedHashUpdate=t}}e.exports=CachedSource},388:function(e,t,n){"use strict";const s=n(980);class CompatSource extends s{static from(e){return e instanceof s?e:new CompatSource(e)}constructor(e){super();this._sourceLike=e}source(){return this._sourceLike.source()}buffer(){if(typeof this._sourceLike.buffer==="function"){return this._sourceLike.buffer()}return super.buffer()}size(){if(typeof this._sourceLike.size==="function"){return this._sourceLike.size()}return super.size()}map(e){if(typeof this._sourceLike.map==="function"){return this._sourceLike.map(e)}return super.map(e)}sourceAndMap(e){if(typeof this._sourceLike.sourceAndMap==="function"){return this._sourceLike.sourceAndMap(e)}return super.sourceAndMap(e)}updateHash(e){if(typeof this._sourceLike.updateHash==="function"){return this._sourceLike.updateHash(e)}if(typeof this._sourceLike.map==="function"){throw new Error("A Source-like object with a 'map' method must also provide an 'updateHash' method")}e.update(this.buffer())}}e.exports=CompatSource},53:function(e,t,n){"use strict";const s=n(980);const r=n(457);const i=n(402);const{getMap:u,getSourceAndMap:o}=n(762);const f=new WeakSet;class ConcatSource extends s{constructor(){super();this._children=[];for(let e=0;e<arguments.length;e++){const t=arguments[e];if(t instanceof ConcatSource){for(const e of t._children){this._children.push(e)}}else{this._children.push(t)}}this._isOptimized=arguments.length===0}getChildren(){if(!this._isOptimized)this._optimize();return this._children}add(e){if(e instanceof ConcatSource){for(const t of e._children){this._children.push(t)}}else{this._children.push(e)}this._isOptimized=false}addAllSkipOptimizing(e){for(const t of e){this._children.push(t)}}buffer(){if(!this._isOptimized)this._optimize();const e=[];for(const t of this._children){if(typeof t.buffer==="function"){e.push(t.buffer())}else{const n=t.source();if(Buffer.isBuffer(n)){e.push(n)}else{e.push(Buffer.from(n,"utf-8"))}}}return Buffer.concat(e)}source(){if(!this._isOptimized)this._optimize();let e="";for(const t of this._children){e+=t.source()}return e}size(){if(!this._isOptimized)this._optimize();let e=0;for(const t of this._children){e+=t.size()}return e}map(e){return u(this,e)}sourceAndMap(e){return o(this,e)}streamChunks(e,t,n,s){if(!this._isOptimized)this._optimize();if(this._children.length===1)return this._children[0].streamChunks(e,t,n,s);let r=0;let u=0;let o=new Map;let f=new Map;const c=!!(e&&e.finalSource);let a="";let h=false;for(const l of this._children){const d=[];const p=[];let _=0;const{generatedLine:g,generatedColumn:S,source:m}=i(l,e,((e,n,s,i,o,f,l)=>{const g=n+r;const S=n===1?s+u:s;if(h){if(n!==1||s!==0){t(undefined,r+1,u,-1,-1,-1,-1)}h=false}const m=i<0||i>=d.length?-1:d[i];const A=l<0||l>=p.length?-1:p[l];_=m<0?0:n;if(c){if(e!==undefined)a+=e;if(m>=0){t(undefined,g,S,m,o,f,A)}}else{if(m<0){t(e,g,S,-1,-1,-1,-1)}else{t(e,g,S,m,o,f,A)}}}),((e,t,s)=>{let r=o.get(t);if(r===undefined){o.set(t,r=o.size);n(r,t,s)}d[e]=r}),((e,t)=>{let n=f.get(t);if(n===undefined){f.set(t,n=f.size);s(n,t)}p[e]=n}));if(m!==undefined)a+=m;if(h){if(g!==1||S!==0){t(undefined,r+1,u,-1,-1,-1,-1);h=false}}if(g>1){u=S}else{u+=S}h=h||c&&_===g;r+=g-1}return{generatedLine:r+1,generatedColumn:u,source:c?a:undefined}}updateHash(e){if(!this._isOptimized)this._optimize();e.update("ConcatSource");for(const t of this._children){t.updateHash(e)}}_optimize(){const e=[];let t=undefined;let n=undefined;const addStringToRawSources=e=>{if(n===undefined){n=e}else if(Array.isArray(n)){n.push(e)}else{n=[typeof n==="string"?n:n.source(),e]}};const addSourceToRawSources=e=>{if(n===undefined){n=e}else if(Array.isArray(n)){n.push(e.source())}else{n=[typeof n==="string"?n:n.source(),e.source()]}};const mergeRawSources=()=>{if(Array.isArray(n)){const t=new r(n.join(""));f.add(t);e.push(t)}else if(typeof n==="string"){const t=new r(n);f.add(t);e.push(t)}else{e.push(n)}};for(const s of this._children){if(typeof s==="string"){if(t===undefined){t=s}else{t+=s}}else{if(t!==undefined){addStringToRawSources(t);t=undefined}if(f.has(s)){addSourceToRawSources(s)}else{if(n!==undefined){mergeRawSources();n=undefined}e.push(s)}}}if(t!==undefined){addStringToRawSources(t)}if(n!==undefined){mergeRawSources()}this._children=e;this._isOptimized=true}}e.exports=ConcatSource},636:function(e,t,n){"use strict";const{getMap:s,getSourceAndMap:r}=n(762);const i=n(99);const u=n(441);const o=n(980);const f=n(846);class OriginalSource extends o{constructor(e,t){super();const n=Buffer.isBuffer(e);this._value=n?undefined:e;this._valueAsBuffer=n?e:undefined;this._name=t}getName(){return this._name}source(){if(this._value===undefined){this._value=this._valueAsBuffer.toString("utf-8")}return this._value}buffer(){if(this._valueAsBuffer===undefined){this._valueAsBuffer=Buffer.from(this._value,"utf-8")}return this._valueAsBuffer}map(e){return s(this,e)}sourceAndMap(e){return r(this,e)}streamChunks(e,t,n,s){if(this._value===undefined){this._value=this._valueAsBuffer.toString("utf-8")}n(0,this._name,this._value);const r=!!(e&&e.finalSource);if(!e||e.columns!==false){const e=f(this._value);let n=1;let s=0;if(e!==null){for(const i of e){const e=i.endsWith("\n");if(e&&i.length===1){if(!r)t(i,n,s,-1,-1,-1,-1)}else{const e=r?undefined:i;t(e,n,s,0,n,s,-1)}if(e){n++;s=0}else{s+=i.length}}}return{generatedLine:n,generatedColumn:s,source:r?this._value:undefined}}else if(r){const e=u(this._value);const{generatedLine:n,generatedColumn:s}=e;if(s===0){for(let e=1;e<n;e++)t(undefined,e,0,0,e,0,-1)}else{for(let e=1;e<=n;e++)t(undefined,e,0,0,e,0,-1)}return e}else{let e=1;const n=i(this._value);let s;for(s of n){t(r?undefined:s,e,0,0,e,0,-1);e++}return n.length===0||s.endsWith("\n")?{generatedLine:n.length+1,generatedColumn:0,source:r?this._value:undefined}:{generatedLine:n.length,generatedColumn:s.length,source:r?this._value:undefined}}}updateHash(e){if(this._valueAsBuffer===undefined){this._valueAsBuffer=Buffer.from(this._value,"utf-8")}e.update("OriginalSource");e.update(this._valueAsBuffer);e.update(this._name||"")}}e.exports=OriginalSource},693:function(e,t,n){"use strict";const s=n(980);const r=n(457);const i=n(402);const{getMap:u,getSourceAndMap:o}=n(762);const f=/\n(?=.|\s)/g;class PrefixSource extends s{constructor(e,t){super();this._source=typeof t==="string"||Buffer.isBuffer(t)?new r(t,true):t;this._prefix=e}getPrefix(){return this._prefix}original(){return this._source}source(){const e=this._source.source();const t=this._prefix;return t+e.replace(f,"\n"+t)}map(e){return u(this,e)}sourceAndMap(e){return o(this,e)}streamChunks(e,t,n,s){const r=this._prefix;const u=r.length;const o=!!(e&&e.columns===false);const{generatedLine:c,generatedColumn:a,source:h}=i(this._source,e,((e,n,s,i,f,c,a)=>{if(s!==0){s+=u}else if(e!==undefined){if(o||i<0){e=r+e}else if(u>0){t(r,n,s,-1,-1,-1,-1);s+=u}}else if(!o){s+=u}t(e,n,s,i,f,c,a)}),n,s);return{generatedLine:c,generatedColumn:a===0?0:u+a,source:h!==undefined?r+h.replace(f,"\n"+r):undefined}}updateHash(e){e.update("PrefixSource");this._source.updateHash(e);e.update(this._prefix)}}e.exports=PrefixSource},457:function(e,t,n){"use strict";const s=n(57);const r=n(980);class RawSource extends r{constructor(e,t=false){super();const n=Buffer.isBuffer(e);if(!n&&typeof e!=="string"){throw new TypeError("argument 'value' must be either string of Buffer")}this._valueIsBuffer=!t&&n;this._value=t&&n?undefined:e;this._valueAsBuffer=n?e:undefined;this._valueAsString=n?undefined:e}isBuffer(){return this._valueIsBuffer}source(){if(this._value===undefined){this._value=this._valueAsBuffer.toString("utf-8")}return this._value}buffer(){if(this._valueAsBuffer===undefined){this._valueAsBuffer=Buffer.from(this._value,"utf-8")}return this._valueAsBuffer}map(e){return null}streamChunks(e,t,n,r){if(this._value===undefined){this._value=Buffer.from(this._valueAsBuffer,"utf-8")}if(this._valueAsString===undefined){this._valueAsString=typeof this._value==="string"?this._value:this._value.toString("utf-8")}return s(this._valueAsString,t,n,r,!!(e&&e.finalSource))}updateHash(e){if(this._valueAsBuffer===undefined){this._valueAsBuffer=Buffer.from(this._value,"utf-8")}e.update("RawSource");e.update(this._valueAsBuffer)}}e.exports=RawSource},795:function(e,t,n){"use strict";const{getMap:s,getSourceAndMap:r}=n(762);const i=n(402);const u=n(980);const o=n(99);const f=typeof process==="object"&&process.versions&&typeof process.versions.v8==="string"&&!/^[0-6]\./.test(process.versions.v8);const c=536870912;class Replacement{constructor(e,t,n,s){this.start=e;this.end=t;this.content=n;this.name=s;if(!f){this.index=-1}}}class ReplaceSource extends u{constructor(e,t){super();this._source=e;this._name=t;this._replacements=[];this._isSorted=true}getName(){return this._name}getReplacements(){this._sortReplacements();return this._replacements}replace(e,t,n,s){if(typeof n!=="string")throw new Error("insertion must be a string, but is a "+typeof n);this._replacements.push(new Replacement(e,t,n,s));this._isSorted=false}insert(e,t,n){if(typeof t!=="string")throw new Error("insertion must be a string, but is a "+typeof t+": "+t);this._replacements.push(new Replacement(e,e-1,t,n));this._isSorted=false}source(){if(this._replacements.length===0){return this._source.source()}let e=this._source.source();let t=0;const n=[];this._sortReplacements();for(const s of this._replacements){const r=Math.floor(s.start);const i=Math.floor(s.end+1);if(t<r){const s=r-t;n.push(e.slice(0,s));e=e.slice(s);t=r}n.push(s.content);if(t<i){const n=i-t;e=e.slice(n);t=i}}n.push(e);return n.join("")}map(e){if(this._replacements.length===0){return this._source.map(e)}return s(this,e)}sourceAndMap(e){if(this._replacements.length===0){return this._source.sourceAndMap(e)}return r(this,e)}original(){return this._source}_sortReplacements(){if(this._isSorted)return;if(f){this._replacements.sort((function(e,t){const n=e.start-t.start;if(n!==0)return n;const s=e.end-t.end;if(s!==0)return s;return 0}))}else{this._replacements.forEach(((e,t)=>e.index=t));this._replacements.sort((function(e,t){const n=e.start-t.start;if(n!==0)return n;const s=e.end-t.end;if(s!==0)return s;return e.index-t.index}))}this._isSorted=true}streamChunks(e,t,n,s){this._sortReplacements();const r=this._replacements;let u=0;let f=0;let a=-1;let h=f<r.length?Math.floor(r[f].start):c;let l=0;let d=0;let p=0;const _=[];const g=new Map;const S=[];const checkOriginalContent=(e,t,n,s)=>{let r=e<_.length?_[e]:undefined;if(r===undefined)return false;if(typeof r==="string"){r=o(r);_[e]=r}const i=t<=r.length?r[t-1]:null;if(i===null)return false;return i.slice(n,n+s.length)===s};let{generatedLine:m,generatedColumn:A}=i(this._source,Object.assign({},e,{finalSource:false}),((e,n,i,o,_,m,A)=>{let M=0;let B=u+e.length;if(a>u){if(a>=B){const t=n+l;if(e.endsWith("\n")){l--;if(p===t){d+=i}}else if(p===t){d-=e.length}else{d=-e.length;p=t}u=B;return}M=a-u;if(checkOriginalContent(o,_,m,e.slice(0,M))){m+=M}u+=M;const t=n+l;if(p===t){d-=M}else{d=-M;p=t}i+=M}if(h<B){do{let v=n+l;if(h>u){const n=h-u;const s=e.slice(M,M+n);t(s,v,i+(v===p?d:0),o,_,m,A<0||A>=S.length?-1:S[A]);i+=n;M+=n;u=h;if(checkOriginalContent(o,_,m,s)){m+=s.length}}const C=/[^\n]+\n?|\n/g;const{content:b,name:O}=r[f];let w=C.exec(b);let y=A;if(o>=0&&O){let e=g.get(O);if(e===undefined){e=g.size;g.set(O,e);s(e,O)}y=e}while(w!==null){const e=w[0];t(e,v,i+(v===p?d:0),o,_,m,y);y=-1;w=C.exec(b);if(w===null&&!e.endsWith("\n")){if(p===v){d+=e.length}else{d=e.length;p=v}}else{l++;v++;d=-i;p=v}}a=Math.max(a,Math.floor(r[f].end+1));f++;h=f<r.length?Math.floor(r[f].start):c;const x=e.length-B+a-M;if(x>0){if(a>=B){let t=n+l;if(e.endsWith("\n")){l--;if(p===t){d+=i}}else if(p===t){d-=e.length-M}else{d=M-e.length;p=t}u=B;return}const t=n+l;if(checkOriginalContent(o,_,m,e.slice(M,M+x))){m+=x}M+=x;u+=x;if(p===t){d-=x}else{d=-x;p=t}i+=x}}while(h<B)}if(M<e.length){const s=M===0?e:e.slice(M);const r=n+l;t(s,r,i+(r===p?d:0),o,_,m,A<0?-1:S[A])}u=B}),((e,t,s)=>{while(_.length<e)_.push(undefined);_[e]=s;n(e,t,s)}),((e,t)=>{let n=g.get(t);if(n===undefined){n=g.size;g.set(t,n);s(n,t)}S[e]=n}));let M="";for(;f<r.length;f++){M+=r[f].content}let B=m+l;const v=/[^\n]+\n?|\n/g;let C=v.exec(M);while(C!==null){const e=C[0];t(e,B,A+(B===p?d:0),-1,-1,-1,-1);C=v.exec(M);if(C===null&&!e.endsWith("\n")){if(p===B){d+=e.length}else{d=e.length;p=B}}else{l++;B++;d=-A;p=B}}return{generatedLine:B,generatedColumn:A+(B===p?d:0)}}updateHash(e){this._sortReplacements();e.update("ReplaceSource");this._source.updateHash(e);e.update(this._name||"");for(const t of this._replacements){e.update(`${t.start}${t.end}${t.content}${t.name}`)}}}e.exports=ReplaceSource},525:function(e,t,n){"use strict";const s=n(980);class SizeOnlySource extends s{constructor(e){super();this._size=e}_error(){return new Error("Content and Map of this Source is not available (only size() is supported)")}size(){return this._size}source(){throw this._error()}buffer(){throw this._error()}map(e){throw this._error()}updateHash(){throw this._error()}}e.exports=SizeOnlySource},980:function(e){"use strict";class Source{source(){throw new Error("Abstract")}buffer(){const e=this.source();if(Buffer.isBuffer(e))return e;return Buffer.from(e,"utf-8")}size(){return this.buffer().length}map(e){return null}sourceAndMap(e){return{source:this.source(),map:this.map(e)}}updateHash(e){throw new Error("Abstract")}}e.exports=Source},629:function(e,t,n){"use strict";const s=n(980);const r=n(706);const i=n(400);const{getMap:u,getSourceAndMap:o}=n(762);class SourceMapSource extends s{constructor(e,t,n,s,r,i){super();const u=Buffer.isBuffer(e);this._valueAsString=u?undefined:e;this._valueAsBuffer=u?e:undefined;this._name=t;this._hasSourceMap=!!n;const o=Buffer.isBuffer(n);const f=typeof n==="string";this._sourceMapAsObject=o||f?undefined:n;this._sourceMapAsString=f?n:undefined;this._sourceMapAsBuffer=o?n:undefined;this._hasOriginalSource=!!s;const c=Buffer.isBuffer(s);this._originalSourceAsString=c?undefined:s;this._originalSourceAsBuffer=c?s:undefined;this._hasInnerSourceMap=!!r;const a=Buffer.isBuffer(r);const h=typeof r==="string";this._innerSourceMapAsObject=a||h?undefined:r;this._innerSourceMapAsString=h?r:undefined;this._innerSourceMapAsBuffer=a?r:undefined;this._removeOriginalSource=i}_ensureValueBuffer(){if(this._valueAsBuffer===undefined){this._valueAsBuffer=Buffer.from(this._valueAsString,"utf-8")}}_ensureValueString(){if(this._valueAsString===undefined){this._valueAsString=this._valueAsBuffer.toString("utf-8")}}_ensureOriginalSourceBuffer(){if(this._originalSourceAsBuffer===undefined&&this._hasOriginalSource){this._originalSourceAsBuffer=Buffer.from(this._originalSourceAsString,"utf-8")}}_ensureOriginalSourceString(){if(this._originalSourceAsString===undefined&&this._hasOriginalSource){this._originalSourceAsString=this._originalSourceAsBuffer.toString("utf-8")}}_ensureInnerSourceMapObject(){if(this._innerSourceMapAsObject===undefined&&this._hasInnerSourceMap){this._ensureInnerSourceMapString();this._innerSourceMapAsObject=JSON.parse(this._innerSourceMapAsString)}}_ensureInnerSourceMapBuffer(){if(this._innerSourceMapAsBuffer===undefined&&this._hasInnerSourceMap){this._ensureInnerSourceMapString();this._innerSourceMapAsBuffer=Buffer.from(this._innerSourceMapAsString,"utf-8")}}_ensureInnerSourceMapString(){if(this._innerSourceMapAsString===undefined&&this._hasInnerSourceMap){if(this._innerSourceMapAsBuffer!==undefined){this._innerSourceMapAsString=this._innerSourceMapAsBuffer.toString("utf-8")}else{this._innerSourceMapAsString=JSON.stringify(this._innerSourceMapAsObject)}}}_ensureSourceMapObject(){if(this._sourceMapAsObject===undefined){this._ensureSourceMapString();this._sourceMapAsObject=JSON.parse(this._sourceMapAsString)}}_ensureSourceMapBuffer(){if(this._sourceMapAsBuffer===undefined){this._ensureSourceMapString();this._sourceMapAsBuffer=Buffer.from(this._sourceMapAsString,"utf-8")}}_ensureSourceMapString(){if(this._sourceMapAsString===undefined){if(this._sourceMapAsBuffer!==undefined){this._sourceMapAsString=this._sourceMapAsBuffer.toString("utf-8")}else{this._sourceMapAsString=JSON.stringify(this._sourceMapAsObject)}}}getArgsAsBuffers(){this._ensureValueBuffer();this._ensureSourceMapBuffer();this._ensureOriginalSourceBuffer();this._ensureInnerSourceMapBuffer();return[this._valueAsBuffer,this._name,this._sourceMapAsBuffer,this._originalSourceAsBuffer,this._innerSourceMapAsBuffer,this._removeOriginalSource]}buffer(){this._ensureValueBuffer();return this._valueAsBuffer}source(){this._ensureValueString();return this._valueAsString}map(e){if(!this._hasInnerSourceMap){this._ensureSourceMapObject();return this._sourceMapAsObject}return u(this,e)}sourceAndMap(e){if(!this._hasInnerSourceMap){this._ensureValueString();this._ensureSourceMapObject();return{source:this._valueAsString,map:this._sourceMapAsObject}}return o(this,e)}streamChunks(e,t,n,s){this._ensureValueString();this._ensureSourceMapObject();this._ensureOriginalSourceString();if(this._hasInnerSourceMap){this._ensureInnerSourceMapObject();return i(this._valueAsString,this._sourceMapAsObject,this._name,this._originalSourceAsString,this._innerSourceMapAsObject,this._removeOriginalSource,t,n,s,!!(e&&e.finalSource),!!(e&&e.columns!==false))}else{return r(this._valueAsString,this._sourceMapAsObject,t,n,s,!!(e&&e.finalSource),!!(e&&e.columns!==false))}}updateHash(e){this._ensureValueBuffer();this._ensureSourceMapBuffer();this._ensureOriginalSourceBuffer();this._ensureInnerSourceMapBuffer();e.update("SourceMapSource");e.update(this._valueAsBuffer);e.update(this._sourceMapAsBuffer);if(this._hasOriginalSource){e.update(this._originalSourceAsBuffer)}if(this._hasInnerSourceMap){e.update(this._innerSourceMapAsBuffer)}e.update(this._removeOriginalSource?"true":"false")}}e.exports=SourceMapSource},437:function(e){"use strict";const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");const n=32;const createMappingsSerializer=e=>{const t=e&&e.columns===false;return t?createLinesOnlyMappingsSerializer():createFullMappingsSerializer()};const createFullMappingsSerializer=()=>{let e=1;let s=0;let r=0;let i=1;let u=0;let o=0;let f=false;let c=false;let a=true;return(h,l,d,p,_,g)=>{if(f&&e===h){if(d===r&&p===i&&_===u&&!c&&g<0){return""}}else{if(d<0){return""}}let S;if(e<h){S=";".repeat(h-e);e=h;s=0;a=false}else if(a){S="";a=false}else{S=","}const writeValue=e=>{const s=e>>>31&1;const r=e>>31;const i=e+r^r;let u=i<<1|s;for(;;){const e=u&31;u>>=5;if(u===0){S+=t[e];break}else{S+=t[e|n]}}};writeValue(l-s);s=l;if(d>=0){f=true;if(d===r){S+="A"}else{writeValue(d-r);r=d}writeValue(p-i);i=p;if(_===u){S+="A"}else{writeValue(_-u);u=_}if(g>=0){writeValue(g-o);o=g;c=true}else{c=false}}else{f=false}return S}};const createLinesOnlyMappingsSerializer=()=>{let e=0;let s=1;let r=0;let i=1;return(u,o,f,c,a,h)=>{if(f<0){return""}if(e===u){return""}let l;const writeValue=e=>{const s=e>>>31&1;const r=e>>31;const i=e+r^r;let u=i<<1|s;for(;;){const e=u&31;u>>=5;if(u===0){l+=t[e];break}else{l+=t[e|n]}}};e=u;if(u===s+1){s=u;if(f===r){r=f;if(c===i+1){i=c;return";AACA"}else{l=";AA";writeValue(c-i);i=c;return l+"A"}}else{l=";A";writeValue(f-r);r=f;writeValue(c-i);i=c;return l+"A"}}else{l=";".repeat(u-s);s=u;if(f===r){r=f;if(c===i+1){i=c;return l+"AACA"}else{l+="AA";writeValue(c-i);i=c;return l+"A"}}else{l+="A";writeValue(f-r);r=f;writeValue(c-i);i=c;return l+"A"}}}};e.exports=createMappingsSerializer},762:function(e,t,n){"use strict";const s=n(437);t.getSourceAndMap=(e,t)=>{let n="";let r="";let i=[];let u=[];let o=[];const f=s(t);const{source:c}=e.streamChunks(Object.assign({},t,{finalSource:true}),((e,t,s,i,u,o,c)=>{if(e!==undefined)n+=e;r+=f(t,s,i,u,o,c)}),((e,t,n)=>{while(i.length<e){i.push(null)}i[e]=t;if(n!==undefined){while(u.length<e){u.push(null)}u[e]=n}}),((e,t)=>{while(o.length<e){o.push(null)}o[e]=t}));return{source:c!==undefined?c:n,map:r.length>0?{version:3,file:"x",mappings:r,sources:i,sourcesContent:u.length>0?u:undefined,names:o}:null}};t.getMap=(e,t)=>{let n="";let r=[];let i=[];let u=[];const o=s(t);e.streamChunks(Object.assign({},t,{source:false,finalSource:true}),((e,t,s,r,i,u,f)=>{n+=o(t,s,r,i,u,f)}),((e,t,n)=>{while(r.length<e){r.push(null)}r[e]=t;if(n!==undefined){while(i.length<e){i.push(null)}i[e]=n}}),((e,t)=>{while(u.length<e){u.push(null)}u[e]=t}));return n.length>0?{version:3,file:"x",mappings:n,sources:r,sourcesContent:i.length>0?i:undefined,names:u}:null}},441:function(e){"use strict";const t="\n".charCodeAt(0);const getGeneratedSourceInfo=e=>{if(e===undefined){return{}}const n=e.lastIndexOf("\n");if(n===-1){return{generatedLine:1,generatedColumn:e.length,source:e}}let s=2;for(let r=0;r<n;r++){if(e.charCodeAt(r)===t)s++}return{generatedLine:s,generatedColumn:e.length-n-1,source:e}};e.exports=getGeneratedSourceInfo},189:function(e){"use strict";const getSource=(e,t)=>{if(t<0)return null;const{sourceRoot:n,sources:s}=e;const r=s[t];if(!n)return r;if(n.endsWith("/"))return n+r;return n+"/"+r};e.exports=getSource},958:function(e){"use strict";const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";const n=32;const s=64;const r=s|1;const i=s|2;const u=31;const o=new Uint8Array("z".charCodeAt(0)+1);{o.fill(i);for(let e=0;e<t.length;e++){o[t.charCodeAt(e)]=e}o[",".charCodeAt(0)]=s;o[";".charCodeAt(0)]=r}const f=o.length-1;const readMappings=(e,t)=>{const i=new Uint32Array([0,0,1,0,0]);let c=0;let a=0;let h=0;let l=1;let d=-1;for(let p=0;p<e.length;p++){const _=e.charCodeAt(p);if(_>f)continue;const g=o[_];if((g&s)!==0){if(i[0]>d){if(c===1){t(l,i[0],-1,-1,-1,-1)}else if(c===4){t(l,i[0],i[1],i[2],i[3],-1)}else if(c===5){t(l,i[0],i[1],i[2],i[3],i[4])}d=i[0]}c=0;if(g===r){l++;i[0]=0;d=-1}}else if((g&n)===0){a|=g<<h;const e=a&1?-(a>>1):a>>1;i[c++]+=e;h=0;a=0}else{a|=(g&u)<<h;h+=5}}if(c===1){t(l,i[0],-1,-1,-1,-1)}else if(c===4){t(l,i[0],i[1],i[2],i[3],-1)}else if(c===5){t(l,i[0],i[1],i[2],i[3],i[4])}};e.exports=readMappings},99:function(e){const splitIntoLines=e=>{const t=[];const n=e.length;let s=0;for(;s<n;){const r=e.charCodeAt(s);if(r===10){t.push("\n");s++}else{let r=s+1;while(r<n&&e.charCodeAt(r)!==10)r++;t.push(e.slice(s,r+1));s=r+1}}return t};e.exports=splitIntoLines},846:function(e){const splitIntoPotentialTokens=e=>{const t=e.length;if(t===0)return null;const n=[];let s=0;for(;s<t;){const r=s;e:{let n=e.charCodeAt(s);while(n!==10&&n!==59&&n!==123&&n!==125){if(++s>=t)break e;n=e.charCodeAt(s)}while(n===59||n===32||n===123||n===125||n===13||n===9){if(++s>=t)break e;n=e.charCodeAt(s)}if(n===10){s++}}n.push(e.slice(r,s))}return n};e.exports=splitIntoPotentialTokens},944:function(e,t,n){"use strict";const s=n(437);const r=n(402);const streamAndGetSourceAndMap=(e,t,n,i,u)=>{let o="";let f="";let c=[];let a=[];let h=[];const l=s(Object.assign({},t,{columns:true}));const d=!!(t&&t.finalSource);const{generatedLine:p,generatedColumn:_,source:g}=r(e,t,((e,t,s,r,i,u,c)=>{if(e!==undefined)o+=e;f+=l(t,s,r,i,u,c);return n(d?undefined:e,t,s,r,i,u,c)}),((e,t,n)=>{while(c.length<e){c.push(null)}c[e]=t;if(n!==undefined){while(a.length<e){a.push(null)}a[e]=n}return i(e,t,n)}),((e,t)=>{while(h.length<e){h.push(null)}h[e]=t;return u(e,t)}));const S=g!==undefined?g:o;return{result:{generatedLine:p,generatedColumn:_,source:d?S:undefined},source:S,map:f.length>0?{version:3,file:"x",mappings:f,sources:c,sourcesContent:a.length>0?a:undefined,names:h}:null}};e.exports=streamAndGetSourceAndMap},402:function(e,t,n){"use strict";const s=n(57);const r=n(706);e.exports=(e,t,n,i,u)=>{if(typeof e.streamChunks==="function"){return e.streamChunks(t,n,i,u)}else{const o=e.sourceAndMap(t);if(o.map){return r(o.source,o.map,n,i,u,!!(t&&t.finalSource),!!(t&&t.columns!==false))}else{return s(o.source,n,i,u,!!(t&&t.finalSource))}}}},400:function(e,t,n){"use strict";const s=n(706);const r=n(99);const streamChunksOfCombinedSourceMap=(e,t,n,i,u,o,f,c,a,h,l)=>{let d=new Map;let p=new Map;const _=[];const g=[];const S=[];let m=-2;const A=[];const M=[];const B=[];const v=[];const C=[];const b=[];const O=[];const findInnerMapping=(e,t)=>{if(e>O.length)return-1;const{mappingsData:n}=O[e-1];let s=0;let r=n.length/5;while(s<r){let e=s+r>>1;if(n[e*5]<=t){s=e+1}else{r=e}}if(s===0)return-1;return s-1};return s(e,t,((t,s,u,h,l,w,y)=>{if(h===m){const m=findInnerMapping(l,w);if(m!==-1){const{chunks:e,mappingsData:n}=O[l-1];const i=m*5;const o=n[i+1];const h=n[i+2];let _=n[i+3];let x=n[i+4];if(o>=0){const l=e[m];const O=n[i];const z=w-O;if(z>0){let e=o<v.length?v[o]:null;if(e===undefined){const t=B[o];e=t?r(t):null;v[o]=e}if(e!==null){const t=h<=e.length?e[h-1].slice(_,_+z):"";if(l.slice(0,z)===t){_+=z;x=-1}}}let k=o<A.length?A[o]:-2;if(k===-2){const[e,t]=o<M.length?M[o]:[null,undefined];let n=d.get(e);if(n===undefined){d.set(e,n=d.size);c(n,e,t)}k=n;A[o]=k}let L=-1;if(x>=0){L=x<C.length?C[x]:-2;if(L===-2){const e=x<b.length?b[x]:undefined;if(e){let t=p.get(e);if(t===undefined){p.set(e,t=p.size);a(t,e)}L=t}else{L=-1}C[x]=L}}else if(y>=0){let e=v[o];if(e===undefined){const t=B[o];e=t?r(t):null;v[o]=e}if(e!==null){const t=S[y];const n=h<=e.length?e[h-1].slice(_,_+t.length):"";if(t===n){L=y<g.length?g[y]:-2;if(L===-2){const e=S[y];if(e){let t=p.get(e);if(t===undefined){p.set(e,t=p.size);a(t,e)}L=t}else{L=-1}g[y]=L}}}}f(t,s,u,k,h,_,L);return}}if(o){f(t,s,u,-1,-1,-1,-1);return}else{if(_[h]===-2){let t=d.get(n);if(t===undefined){d.set(e,t=d.size);c(t,n,i)}_[h]=t}}}const x=h<0||h>=_.length?-1:_[h];if(x<0){f(t,s,u,-1,-1,-1,-1)}else{let e=-1;if(y>=0&&y<g.length){e=g[y];if(e===-2){const t=S[y];let n=p.get(t);if(n===undefined){p.set(t,n=p.size);a(n,t)}e=n;g[y]=e}}f(t,s,u,x,l,w,e)}}),((e,t,r)=>{if(t===n){m=e;if(i!==undefined)r=i;else i=r;_[e]=-2;s(r,u,((e,t,n,s,r,i,u)=>{while(O.length<t){O.push({mappingsData:[],chunks:[]})}const o=O[t-1];o.mappingsData.push(n,s,r,i,u);o.chunks.push(e)}),((e,t,n)=>{B[e]=n;v[e]=undefined;A[e]=-2;M[e]=[t,n]}),((e,t)=>{C[e]=-2;b[e]=t}),false,l)}else{let n=d.get(t);if(n===undefined){d.set(t,n=d.size);c(n,t,r)}_[e]=n}}),((e,t)=>{g[e]=-2;S[e]=t}),h,l)};e.exports=streamChunksOfCombinedSourceMap},57:function(e,t,n){"use strict";const s=n(441);const r=n(99);const streamChunksOfRawSource=(e,t,n,s)=>{let i=1;const u=r(e);let o;for(o of u){t(o,i,0,-1,-1,-1,-1);i++}return u.length===0||o.endsWith("\n")?{generatedLine:u.length+1,generatedColumn:0}:{generatedLine:u.length,generatedColumn:o.length}};e.exports=(e,t,n,r,i)=>i?s(e):streamChunksOfRawSource(e,t,n,r)},706:function(e,t,n){"use strict";const s=n(441);const r=n(189);const i=n(958);const u=n(99);const streamChunksOfSourceMapFull=(e,t,n,s,o)=>{const f=u(e);if(f.length===0){return{generatedLine:1,generatedColumn:0}}const{sources:c,sourcesContent:a,names:h,mappings:l}=t;for(let e=0;e<c.length;e++){s(e,r(t,e),a&&a[e]||undefined)}if(h){for(let e=0;e<h.length;e++){o(e,h[e])}}const d=f[f.length-1];const p=d.endsWith("\n");const _=p?f.length+1:f.length;const g=p?0:d.length;let S=1;let m=0;let A=false;let M=-1;let B=-1;let v=-1;let C=-1;const onMapping=(e,t,s,r,i,u)=>{if(A&&S<=f.length){let s;const r=S;const i=m;const u=f[S-1];if(e!==S){s=u.slice(m);S++;m=0}else{s=u.slice(m,t);m=t}if(s){n(s,r,i,M,B,v,C)}A=false}if(e>S&&m>0){if(S<=f.length){const e=f[S-1].slice(m);n(e,S,m,-1,-1,-1,-1)}S++;m=0}while(e>S){if(S<=f.length){n(f[S-1],S,0,-1,-1,-1,-1)}S++}if(t>m){if(S<=f.length){const e=f[S-1].slice(m,t);n(e,S,m,-1,-1,-1,-1)}m=t}if(s>=0&&(e<_||e===_&&t<g)){A=true;M=s;B=r;v=i;C=u}};i(l,onMapping);onMapping(_,g,-1,-1,-1,-1);return{generatedLine:_,generatedColumn:g}};const streamChunksOfSourceMapLinesFull=(e,t,n,s,o)=>{const f=u(e);if(f.length===0){return{generatedLine:1,generatedColumn:0}}const{sources:c,sourcesContent:a,mappings:h}=t;for(let e=0;e<c.length;e++){s(e,r(t,e),a&&a[e]||undefined)}let l=1;const onMapping=(e,t,s,r,i,u)=>{if(s<0||e<l||e>f.length){return}while(e>l){if(l<=f.length){n(f[l-1],l,0,-1,-1,-1,-1)}l++}if(e<=f.length){n(f[e-1],e,0,s,r,i,-1);l++}};i(h,onMapping);for(;l<=f.length;l++){n(f[l-1],l,0,-1,-1,-1,-1)}const d=f[f.length-1];const p=d.endsWith("\n");const _=p?f.length+1:f.length;const g=p?0:d.length;return{generatedLine:_,generatedColumn:g}};const streamChunksOfSourceMapFinal=(e,t,n,u,o)=>{const f=s(e);const{generatedLine:c,generatedColumn:a}=f;if(c===1&&a===0)return f;const{sources:h,sourcesContent:l,names:d,mappings:p}=t;for(let e=0;e<h.length;e++){u(e,r(t,e),l&&l[e]||undefined)}if(d){for(let e=0;e<d.length;e++){o(e,d[e])}}let _=0;const onMapping=(e,t,s,r,i,u)=>{if(e>=c&&(t>=a||e>c)){return}if(s>=0){n(undefined,e,t,s,r,i,u);_=e}else if(_===e){n(undefined,e,t,-1,-1,-1,-1);_=0}};i(p,onMapping);return f};const streamChunksOfSourceMapLinesFinal=(e,t,n,u,o)=>{const f=s(e);const{generatedLine:c,generatedColumn:a}=f;if(c===1&&a===0){return{generatedLine:1,generatedColumn:0}}const{sources:h,sourcesContent:l,mappings:d}=t;for(let e=0;e<h.length;e++){u(e,r(t,e),l&&l[e]||undefined)}const p=a===0?c-1:c;let _=1;const onMapping=(e,t,s,r,i,u)=>{if(s>=0&&_<=e&&e<=p){n(undefined,e,0,s,r,i,-1);_=e+1}};i(d,onMapping);return f};e.exports=(e,t,n,s,r,i,u)=>{if(u){return i?streamChunksOfSourceMapFinal(e,t,n,s,r):streamChunksOfSourceMapFull(e,t,n,s,r)}else{return i?streamChunksOfSourceMapLinesFinal(e,t,n,s,r):streamChunksOfSourceMapLinesFull(e,t,n,s,r)}}},275:function(e,t,n){const defineExport=(e,n)=>{let s;Object.defineProperty(t,e,{get:()=>{if(n!==undefined){s=n();n=undefined}return s},configurable:true})};defineExport("Source",(()=>n(980)));defineExport("RawSource",(()=>n(457)));defineExport("OriginalSource",(()=>n(636)));defineExport("SourceMapSource",(()=>n(629)));defineExport("CachedSource",(()=>n(91)));defineExport("ConcatSource",(()=>n(53)));defineExport("ReplaceSource",(()=>n(795)));defineExport("PrefixSource",(()=>n(693)));defineExport("SizeOnlySource",(()=>n(525)));defineExport("CompatSource",(()=>n(388)))}};var t={};function __nccwpck_require__(n){var s=t[n];if(s!==undefined){return s.exports}var r=t[n]={exports:{}};var i=true;try{e[n](r,r.exports,__nccwpck_require__);i=false}finally{if(i)delete t[n]}return r.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var n=__nccwpck_require__(275);module.exports=n})();