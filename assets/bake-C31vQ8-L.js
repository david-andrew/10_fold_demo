var Bt=Object.defineProperty;var Ut=(e,t,n)=>t in e?Bt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var nt=(e,t,n)=>Ut(e,typeof t!="symbol"?t+"":t,n);import{ad as Ot,ae as ot,af as Ve,ag as ce,ah as Tt,J as qe,ai as vt,V as D,l as Rt,aj as we,ak as xt,a as Ft,al as be,L as jt,am as he,an as Nt,t as te,M as Ge,ao as Vt,ac as Wt}from"./index-Tyhvou-F.js";const st=new qe,ye=new D;class wt extends Ot{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const t=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],n=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],o=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(o),this.setAttribute("position",new ot(t,3)),this.setAttribute("uv",new ot(n,2))}applyMatrix4(t){const n=this.attributes.instanceStart,o=this.attributes.instanceEnd;return n!==void 0&&(n.applyMatrix4(t),o.applyMatrix4(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(t){let n;t instanceof Float32Array?n=t:Array.isArray(t)&&(n=new Float32Array(t));const o=new Ve(n,6,1);return this.setAttribute("instanceStart",new ce(o,3,0)),this.setAttribute("instanceEnd",new ce(o,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(t){let n;t instanceof Float32Array?n=t:Array.isArray(t)&&(n=new Float32Array(t));const o=new Ve(n,6,1);return this.setAttribute("instanceColorStart",new ce(o,3,0)),this.setAttribute("instanceColorEnd",new ce(o,3,3)),this}fromWireframeGeometry(t){return this.setPositions(t.attributes.position.array),this}fromEdgesGeometry(t){return this.setPositions(t.attributes.position.array),this}fromMesh(t){return this.fromWireframeGeometry(new Tt(t.geometry)),this}fromLineSegments(t){const n=t.geometry;return this.setPositions(n.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qe);const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;t!==void 0&&n!==void 0&&(this.boundingBox.setFromBufferAttribute(t),st.setFromBufferAttribute(n),this.boundingBox.union(st))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vt),this.boundingBox===null&&this.computeBoundingBox();const t=this.attributes.instanceStart,n=this.attributes.instanceEnd;if(t!==void 0&&n!==void 0){const o=this.boundingSphere.center;this.boundingBox.getCenter(o);let s=0;for(let i=0,r=t.count;i<r;i++)ye.fromBufferAttribute(t,i),s=Math.max(s,o.distanceToSquared(ye)),ye.fromBufferAttribute(n,i),s=Math.max(s,o.distanceToSquared(ye));this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(t){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(t)}}be.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Ft(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};we.line={uniforms:xt.merge([be.common,be.fog,be.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class bt extends Rt{constructor(t){super({type:"LineMaterial",uniforms:xt.clone(we.line.uniforms),vertexShader:we.line.vertexShader,fragmentShader:we.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(t)}get color(){return this.uniforms.diffuse.value}set color(t){this.uniforms.diffuse.value=t}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(t){t===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(t){this.uniforms.linewidth&&(this.uniforms.linewidth.value=t)}get dashed(){return"USE_DASH"in this.defines}set dashed(t){t===!0!==this.dashed&&(this.needsUpdate=!0),t===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(t){this.uniforms.dashScale.value=t}get dashSize(){return this.uniforms.dashSize.value}set dashSize(t){this.uniforms.dashSize.value=t}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(t){this.uniforms.dashOffset.value=t}get gapSize(){return this.uniforms.gapSize.value}set gapSize(t){this.uniforms.gapSize.value=t}get opacity(){return this.uniforms.opacity.value}set opacity(t){this.uniforms&&(this.uniforms.opacity.value=t)}get resolution(){return this.uniforms.resolution.value}set resolution(t){this.uniforms.resolution.value.copy(t)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(t){this.defines&&(t===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),t===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const Te=new he,rt=new D,it=new D,q=new he,G=new he,X=new he,Re=new D,Fe=new te,$=new Nt,at=new D,ge=new qe,ve=new vt,Y=new he;let Z,ae;function ct(e,t,n){return Y.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),Y.multiplyScalar(1/Y.w),Y.x=ae/n.width,Y.y=ae/n.height,Y.applyMatrix4(e.projectionMatrixInverse),Y.multiplyScalar(1/Y.w),Math.abs(Math.max(Y.x,Y.y))}function Ht(e,t){const n=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,i=o.attributes.instanceEnd,r=Math.min(o.instanceCount,s.count);for(let a=0,c=r;a<c;a++){$.start.fromBufferAttribute(s,a),$.end.fromBufferAttribute(i,a),$.applyMatrix4(n);const l=new D,u=new D;Z.distanceSqToSegment($.start,$.end,u,l),u.distanceTo(l)<ae*.5&&t.push({point:u,pointOnLine:l,distance:Z.origin.distanceTo(u),object:e,face:null,faceIndex:a,uv:null,uv1:null})}}function qt(e,t,n){const o=t.projectionMatrix,i=e.material.resolution,r=e.matrixWorld,a=e.geometry,c=a.attributes.instanceStart,l=a.attributes.instanceEnd,u=Math.min(a.instanceCount,c.count),d=-t.near;Z.at(1,X),X.w=1,X.applyMatrix4(t.matrixWorldInverse),X.applyMatrix4(o),X.multiplyScalar(1/X.w),X.x*=i.x/2,X.y*=i.y/2,X.z=0,Re.copy(X),Fe.multiplyMatrices(t.matrixWorldInverse,r);for(let m=0,g=u;m<g;m++){if(q.fromBufferAttribute(c,m),G.fromBufferAttribute(l,m),q.w=1,G.w=1,q.applyMatrix4(Fe),G.applyMatrix4(Fe),q.z>d&&G.z>d)continue;if(q.z>d){const S=q.z-G.z,v=(q.z-d)/S;q.lerp(G,v)}else if(G.z>d){const S=G.z-q.z,v=(G.z-d)/S;G.lerp(q,v)}q.applyMatrix4(o),G.applyMatrix4(o),q.multiplyScalar(1/q.w),G.multiplyScalar(1/G.w),q.x*=i.x/2,q.y*=i.y/2,G.x*=i.x/2,G.y*=i.y/2,$.start.copy(q),$.start.z=0,$.end.copy(G),$.end.z=0;const h=$.closestPointToPointParameter(Re,!0);$.at(h,at);const b=Ge.lerp(q.z,G.z,h),M=b>=-1&&b<=1,I=Re.distanceTo(at)<ae*.5;if(M&&I){$.start.fromBufferAttribute(c,m),$.end.fromBufferAttribute(l,m),$.start.applyMatrix4(r),$.end.applyMatrix4(r);const S=new D,v=new D;Z.distanceSqToSegment($.start,$.end,v,S),n.push({point:v,pointOnLine:S,distance:Z.origin.distanceTo(v),object:e,face:null,faceIndex:m,uv:null,uv1:null})}}}class Gt extends jt{constructor(t=new wt,n=new bt({color:Math.random()*16777215})){super(t,n),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const t=this.geometry,n=t.attributes.instanceStart,o=t.attributes.instanceEnd,s=new Float32Array(2*n.count);for(let r=0,a=0,c=n.count;r<c;r++,a+=2)rt.fromBufferAttribute(n,r),it.fromBufferAttribute(o,r),s[a]=a===0?0:s[a-1],s[a+1]=s[a]+rt.distanceTo(it);const i=new Ve(s,2,1);return t.setAttribute("instanceDistanceStart",new ce(i,1,0)),t.setAttribute("instanceDistanceEnd",new ce(i,1,1)),this}raycast(t,n){const o=this.material.worldUnits,s=t.camera;s===null&&!o&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const i=t.params.Line2!==void 0&&t.params.Line2.threshold||0;Z=t.ray;const r=this.matrixWorld,a=this.geometry,c=this.material;ae=c.linewidth+i,a.boundingSphere===null&&a.computeBoundingSphere(),ve.copy(a.boundingSphere).applyMatrix4(r);let l;if(o)l=ae*.5;else{const d=Math.max(s.near,ve.distanceToPoint(Z.origin));l=ct(s,d,c.resolution)}if(ve.radius+=l,Z.intersectsSphere(ve)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),ge.copy(a.boundingBox).applyMatrix4(r);let u;if(o)u=ae*.5;else{const d=Math.max(s.near,ge.distanceToPoint(Z.origin));u=ct(s,d,c.resolution)}ge.expandByScalar(u),Z.intersectsBox(ge)!==!1&&(o?Ht(this,n):qt(this,s,n))}onBeforeRender(t){const n=this.material.uniforms;n&&n.resolution&&(t.getViewport(Te),this.material.uniforms.resolution.value.set(Te.z,Te.w))}}class $t extends wt{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(t){const n=t.length-3,o=new Float32Array(2*n);for(let s=0;s<n;s+=3)o[2*s]=t[s],o[2*s+1]=t[s+1],o[2*s+2]=t[s+2],o[2*s+3]=t[s+3],o[2*s+4]=t[s+4],o[2*s+5]=t[s+5];return super.setPositions(o),this}setColors(t){const n=t.length-3,o=new Float32Array(2*n);for(let s=0;s<n;s+=3)o[2*s]=t[s],o[2*s+1]=t[s+1],o[2*s+2]=t[s+2],o[2*s+3]=t[s+3],o[2*s+4]=t[s+4],o[2*s+5]=t[s+5];return super.setColors(o),this}fromLine(t){const n=t.geometry;return this.setPositions(n.attributes.position.array),this}}class Rn extends Gt{constructor(t=new $t,n=new bt({color:Math.random()*16777215})){super(t,n),this.isLine2=!0,this.type="Line2"}}const U=1e-6,kt=1e-9,lt=(e,t)=>[e[0]+t[0],e[1]+t[1]],F=(e,t)=>[e[0]-t[0],e[1]-t[1]],Se=(e,t)=>[e[0]*t,e[1]*t],le=(e,t)=>e[0]*t[0]+e[1]*t[1],ee=(e,t)=>e[0]*t[1]-e[1]*t[0],fe=e=>Math.hypot(e[0],e[1]),O=(e,t)=>fe(F(e,t)),Ie=e=>Se(e,1/fe(e)),se=(e,t,n)=>[e[0]+(t[0]-e[0])*n,e[1]+(t[1]-e[1])*n],Ae=e=>[-e[1],e[0]],$e=(e,t)=>se(e,t,.5),St=(e,t)=>({p:e,d:Ie(F(t,e))}),ke=(e,t)=>{const n=$e(e,t),o=Ie(Ae(F(t,e)));return{p:n,d:o}},k=(e,t)=>ee(e.d,F(t,e.p)),ft=(e,t,n)=>{const o=k(n,e),s=k(n,t);if(Math.abs(o-s)<1e-12)return null;const i=o/(o-s);return i<-U||i>1+U?null:se(e,t,i)},Jt={a:1,b:0,c:0,d:1,tx:0,ty:0},W=(e,t)=>[e.a*t[0]+e.b*t[1]+e.tx,e.c*t[0]+e.d*t[1]+e.ty],Kt=(e,t)=>[e.a*t[0]+e.b*t[1],e.c*t[0]+e.d*t[1]],ne=(e,t)=>({a:e.a*t.a+e.b*t.c,b:e.a*t.b+e.b*t.d,c:e.c*t.a+e.d*t.c,d:e.c*t.b+e.d*t.d,tx:e.a*t.tx+e.b*t.ty+e.tx,ty:e.c*t.tx+e.d*t.ty+e.ty}),me=e=>{const t=e.a*e.d-e.b*e.c,n=e.d/t,o=-e.b/t,s=-e.c/t,i=e.a/t;return{a:n,b:o,c:s,d:i,tx:-(n*e.tx+o*e.ty),ty:-(s*e.tx+i*e.ty)}},Qt=e=>e.a*e.d-e.b*e.c,Je=e=>Qt(e)<0,ue=e=>{const t=Ae(e.d),[n,o]=t,s=2*le(e.p,t);return{a:1-2*n*n,b:-2*n*o,c:-2*n*o,d:1-2*o*o,tx:s*n,ty:s*o}},ze=(e,t)=>({p:W(e,t.p),d:Ie(Kt(e,t.d))}),re=e=>{let t=0;for(let n=0;n<e.length;n++)t+=ee(e[n],e[(n+1)%e.length]);return t/2},Xt=e=>{let t=0,n=0,o=0;for(let s=0;s<e.length;s++){const i=e[s],r=e[(s+1)%e.length],a=ee(i,r);o+=a,t+=(i[0]+r[0])*a,n+=(i[1]+r[1])*a}return o/=2,[t/(6*o),n/(6*o)]},de=e=>re(e)<0?[...e].reverse():e,Le=1e-4,Yt=e=>{const t=[];for(const o of e)t.length>0&&O(t[t.length-1],o)<Le||t.push(o);for(;t.length>1&&O(t[0],t[t.length-1])<Le;)t.pop();const n=[];for(let o=0;o<t.length;o++){const s=t[(o-1+t.length)%t.length],i=t[o],r=t[(o+1)%t.length];Math.abs(ee(F(i,s),F(r,i)))<kt&&le(F(i,s),F(r,i))>0||n.push(i)}return n},pe=(e,t,n)=>{const o=[],s=e.length;for(let i=0;i<s;i++){const r=e[i],a=e[(i+1)%s],c=n*k(t,r),l=n*k(t,a);if(c>=-U){if(o.push(r),l<-U&&c>U){const u=ft(r,a,t);u&&o.push(u)}}else if(l>U){const u=ft(r,a,t);u&&o.push(u)}}return Yt(o)},Pe=(e,t)=>{const n=pe(e,t,1),o=pe(e,t,-1),s=.001,i=n.length>=3&&Math.abs(re(n))>s,r=o.length>=3&&Math.abs(re(o))>s;return i&&!r?{pos:e,neg:null}:!i&&r?{pos:null,neg:e}:!i&&!r?{pos:null,neg:null}:{pos:n,neg:o}},Zt=(e,t,n,o)=>{const s=de(n),i=F(t,e);let r=0,a=1;const c=s.length;for(let l=0;l<c;l++){const u=F(s[(l+1)%c],s[l]),d=fe(u);if(d<Le)continue;const m=ee(u,F(e,s[l]))-o*d,g=ee(u,i);if(Math.abs(g)<1e-12){if(m<0)return 0;continue}const p=-m/g;if(g>0?p>r&&(r=p):p<a&&(a=p),r>=a)return 0}return(a-r)*fe(i)},en=(e,t)=>{let n=de(e);const o=de(t),s=o.length;for(let i=0;i<s;i++){if(n.length<3)return 0;const r=St(o[i],o[(i+1)%s]);n=pe(n,r,1)}return n.length<3?0:Math.abs(re(n))},We=(e,t)=>en(e,t)>1e-4,Mt=(e,t,n=U)=>{const o=de(e),s=o.length;for(let i=0;i<s;i++){const r=o[i],a=o[(i+1)%s],c=fe(F(a,r));if(!(c<Le)&&ee(F(a,r),F(t,r))<-n*c)return!1}return!0},Fn=(e,t)=>{let n=e[0],o=1/0,s=0;const i=e.length;for(let r=0;r<i;r++){const a=e[r],c=e[(r+1)%i],l=F(c,a),u=le(l,l),d=u<1e-12?0:Math.max(0,Math.min(1,le(F(t,a),l)/u)),m=se(a,c,d),g=O(m,t);g<o&&(o=g,n=m,s=r)}return{point:n,edge:s,distance:o}},At=(e,t,n,o)=>{const s=F(t,e),i=fe(s);if(i<U)return null;const r=Se(s,1/i);if(Math.abs(ee(r,F(n,e)))>.005||Math.abs(ee(r,F(o,e)))>.005)return null;const a=0,c=i;let l=le(F(n,e),r),u=le(F(o,e),r);l>u&&([l,u]=[u,l]);const d=Math.max(a,l),m=Math.min(c,u);return m-d<.001?null:[lt(e,Se(r,d)),lt(e,Se(r,m))]},Ke=(e,t)=>{const n=[];for(let o=0;o<e.length;o++){const s=e[o],i=e[(o+1)%e.length];for(let r=0;r<t.length;r++){const a=t[r],c=t[(r+1)%t.length],l=At(s,i,a,c);l&&n.push(l)}}return n},tn=e=>({facets:[{poly:de(e),iso:{...Jt},layer:0}],overrides:[]}),oe=e=>e.poly.map(t=>W(e.iso,t)),ut=new WeakMap,nn=.02,Q=e=>{const t=ut.get(e.facets);if(t)return t;const n=[],o=e.facets.length,s=e.facets.map(r=>{let a=1/0,c=1/0,l=-1/0,u=-1/0;for(const d of r.poly)d[0]<a&&(a=d[0]),d[0]>l&&(l=d[0]),d[1]<c&&(c=d[1]),d[1]>u&&(u=d[1]);return{x0:a,y0:c,x1:l,y1:u}}),i=.01;for(let r=0;r<o;r++){const a=s[r];for(let c=r+1;c<o;c++){const l=s[c];if(a.x1<l.x0-i||l.x1<a.x0-i||a.y1<l.y0-i||l.y1<a.y0-i)continue;const u=Ke(e.facets[r].poly,e.facets[c].poly);for(const d of u)O(d[0],d[1])<nn||n.push({a:r,b:c,seg:d})}}return ut.set(e.facets,n),n},Qe=(e,t)=>{for(const n of e.overrides)if(_e(n.point,t.seg))return n;return null},_e=(e,t)=>{const n=O(t[0],t[1]);return n<U?!1:Math.abs(O(e,t[0])+O(e,t[1])-n)<U*100},on=e=>$e(e.seg[0],e.seg[1]),De=(e,t)=>{const n=t.map(p=>{var h;return((h=Qe(e,p))==null?void 0:h.angle)??null});if(e.overrides.length===0)return n;const o=t.length,s=t.map(p=>[W(e.facets[p.a].iso,p.seg[0]),W(e.facets[p.a].iso,p.seg[1])]),i=Array.from({length:o},(p,h)=>h),r=p=>{for(;i[p]!==p;)i[p]=i[i[p]],p=i[p];return p};for(let p=0;p<o;p++)for(let h=p+1;h<o;h++)r(p)!==r(h)&&At(s[p][0],s[p][1],s[h][0],s[h][1])&&(i[r(p)]=r(h));const a=e.facets.length,c=Array.from({length:a},(p,h)=>h),l=p=>{for(;c[p]!==p;)c[p]=c[c[p]],p=c[p];return p},u=new Set;for(let p=0;p<o;p++)n[p]!==null&&n[p]<180&&u.add(r(p));t.forEach((p,h)=>{u.has(r(h))&&!(n[h]!==null&&n[h]>=180)||(c[l(p.a)]=l(p.b))});const d=p=>{const h=l(t[p].a),b=l(t[p].b);return`${r(p)}:${Math.min(h,b)},${Math.max(h,b)}`},m=new Map;for(let p=0;p<o;p++)n[p]!==null&&n[p]<180&&m.set(d(p),n[p]);const g=n.slice();for(let p=0;p<o;p++)g[p]===null&&(g[p]=m.get(d(p))??null);return g},dt=new WeakMap,Ce=(e,t=Q(e))=>{const n=dt.get(e);if(n)return n;const o=e.facets.length,s=Array.from({length:o},(h,b)=>b),i=h=>{for(;s[h]!==h;)s[h]=s[s[h]],h=s[h];return h},r=e.overrides.length===0?t.map(()=>null):De(e,t);t.forEach((h,b)=>{(r[b]===null||r[b]>=180)&&(s[i(h.a)]=i(h.b))});const a=new Map,c=e.facets.map((h,b)=>{const M=i(b);return a.has(M)||a.set(M,a.size),a.get(M)}),l=a.size,u=new Array(l).fill(0);e.facets.forEach((h,b)=>u[c[b]]+=Math.abs(re(h.poly)));const d=Array.from({length:l},()=>new Set);t.forEach(h=>{const b=c[h.a],M=c[h.b];b!==M&&(d[b].add(M),d[M].add(b))});const m=u.reduce((h,b)=>h+b,0);let g=u.indexOf(Math.max(...u));for(let h=0;h<l;h++){const b=(I,S)=>{let v=0;const A=new Set([I,S]),C=[S];for(;C.length>0;){const T=C.pop();v+=u[T];for(const j of d[T])A.has(j)||(A.add(j),C.push(j))}return v},M=[...d[g]].find(I=>b(g,I)>m/2);if(M===void 0)break;g=M}const p={compOf:c,base:g,count:l};return dt.set(e,p),p},pt=new WeakMap,sn=(e,t=Q(e))=>{if(e.overrides.length===0)return[];const n=pt.get(e);if(n)return n;const o=De(e,t),s=[];return t.forEach((i,r)=>{if(o[r]===null||o[r]>=180)return;const a=e.facets[i.a].iso;s.push({seg:[W(a,i.seg[0]),W(a,i.seg[1])],a:i.a,b:i.b})}),pt.set(e,s),s},rn=(e,t=Q(e))=>{if(e.overrides.length===0)return new Set;const{compOf:n,base:o}=Ce(e,t),s=new Set;return n.forEach((i,r)=>{i!==o&&s.add(r)}),s},Ee=(e,t,n,o=.005,s)=>{let i=-1,r=n===1?-1/0:1/0;return e.facets.forEach((a,c)=>{s!=null&&s.has(c)||Mt(oe(a),t,o)&&(n===1?a.layer>r:a.layer<r)&&(r=a.layer,i=c)}),i},Lt=e=>{const n=[];for(const o of e){const s=o.poly.map(i=>{for(const r of n)if(O(r,i)<.002)return r;return n.push(i),i});o.poly=s.filter((i,r)=>i!==s[(r+1)%s.length])}},_t=e=>{const t=[...new Set(e.map(o=>o.layer))].sort((o,s)=>o-s),n=new Map(t.map((o,s)=>[o,s]));e.forEach(o=>o.layer=n.get(o.layer))},an=e=>{for(const n of Q(e)){const o=e.facets[n.a],s=e.facets[n.b];for(const i of n.seg){const r=W(o.iso,i),a=W(s.iso,i);if(O(r,a)>.01)return`torn crease between facets ${n.a} and ${n.b}`}}const t=e.facets.map(oe);for(let n=0;n<e.facets.length;n++)for(let o=n+1;o<e.facets.length;o++)if(e.facets[n].layer===e.facets[o].layer&&We(t[n],t[o]))return`facets ${n} and ${o} overlap on layer ${e.facets[n].layer}`;return null},ht=(e,t)=>{const n=new te;return n.set(e.a,e.b,0,e.tx,e.c,e.d,0,e.ty,0,0,1,t,0,0,0,1),n};class cn{constructor(t){nt(this,"parent");this.parent=Array.from({length:t},(n,o)=>o)}find(t){for(;this.parent[t]!==t;)this.parent[t]=this.parent[this.parent[t]],t=this.parent[t];return t}union(t,n){const o=this.find(t),s=this.find(n);return o===s?!1:(this.parent[o]=s,!0)}}const Et=(e,t)=>{const n=e.facets.length,o=e.facets.map(x=>ht(x.iso,0)),s=Q(e);if(e.overrides.length===0)return{matrices:e.facets.map(x=>ht(x.iso,x.layer*t)),layerDirs:e.facets.map(()=>new D(0,0,1)),creases:s};const i=De(e,s),r=s.map((x,L)=>({crease:x,angle:i[L]}));r.sort((x,L)=>+(x.angle===null)-+(L.angle===null));const a=new cn(n),c=Array.from({length:n},()=>[]);for(const x of r)a.union(x.crease.a,x.crease.b)&&(c[x.crease.a].push({to:x.crease.b,edge:x}),c[x.crease.b].push({to:x.crease.a,edge:x}));const{compOf:l,base:u}=Ce(e,s);let d=0,m=-1/0;e.facets.forEach((x,L)=>{if(l[L]!==u)return;const z=Math.abs(re(x.poly));z>m&&(m=z,d=L)});const g=new Array(n),p=new Array(n),h=new Array(n),b=new Array(n).fill(null),M=new Array(n).fill(-1),I=new Array(n).fill(!1),S=x=>{I[x]=!0;for(const{to:L,edge:z}of c[x]){if(I[L])continue;const V=o[x].clone().invert().multiply(o[L]);let H=V,_=V;if(z.angle!==null&&z.angle<180){const E=z.crease,w=W(e.facets[x].iso,E.seg[0]),f=W(e.facets[x].iso,E.seg[1]),y=Ie(F(f,w)),B=St(w,f),R=Xt(oe(e.facets[L])),P=Math.sign(k(B,R))||1,N=Math.sign(e.facets[L].layer-e.facets[x].layer)||1,J=[Ae(y)[0]*P,Ae(y)[1]*P],tt=ee(y,J)*N>0?1:-1,Ue=new D(y[0]*tt,y[1]*tt,0),Oe=(180-z.angle)*Math.PI/180,zt=Math.min(Oe,Math.PI),K=new D(w[0],w[1],0),Pt=new te().makeTranslation(K.x,K.y,K.z).multiply(new te().makeRotationAxis(Ue,Oe)).multiply(new te().makeTranslation(-K.x,-K.y,-K.z)),Dt=new te().makeTranslation(K.x,K.y,K.z).multiply(new te().makeRotationAxis(Ue,zt)).multiply(new te().makeTranslation(-K.x,-K.y,-K.z));H=o[x].clone().invert().multiply(Pt).multiply(o[L]),_=o[x].clone().invert().multiply(Dt).multiply(o[L]);const Ct=new te().makeRotationAxis(Ue,Oe/2);b[L]=new D(0,0,1).transformDirection(p[x].clone().multiply(o[x].clone().invert()).multiply(Ct)),M[L]=x}g[L]=g[x].clone().multiply(H),p[L]=p[x].clone().multiply(_),h[L]=new D(0,0,1).transformDirection(p[L]),S(L)}};g[d]=o[d].clone(),p[d]=o[d].clone(),h[d]=new D(0,0,1),S(d);for(let x=0;x<n;x++)I[x]||(g[x]=o[x],h[x]=new D(0,0,1));const v=l.reduce((x,L)=>Math.max(x,L),0)+1,A=new Array(v);for(let x=0;x<n;x++)A[l[x]]=h[x];const C=new Array(v).fill(null);C[u]=new D;const T=[u];for(;T.length;){const x=T.shift(),L=new Map;s.forEach((z,V)=>{const H=i[V];if(!(H===null||H>=180))for(const[_,E]of[[z.a,z.b],[z.b,z.a]]){if(l[_]!==x||l[E]===x||C[l[E]]!==null)continue;const w=L.get(l[E])??{lu:0,lv:0,count:0};w.lu+=e.facets[_].layer,w.lv+=e.facets[E].layer,w.count++,L.set(l[E],w)}});for(const[z,{lu:V,lv:H,count:_}]of L){const E=V/_*t,w=H/_*t;let f=null;for(let y=0;y<n&&!f;y++)l[y]===z&&b[y]&&l[M[y]]===x&&(f=b[y]);C[z]=C[x].clone().addScaledVector(A[x],E).addScaledVector(f??A[z],w-E).addScaledVector(A[z],-w),T.push(z)}}return{matrices:g.map((x,L)=>{if(t===0)return x;const z=(C[l[L]]??new D).clone().addScaledVector(h[L],e.facets[L].layer*t),V=x.clone();return V.elements[12]+=z.x,V.elements[13]+=z.y,V.elements[14]+=z.z,V}),layerDirs:h,creases:s}},ln=.05,Xe=e=>{if(e.overrides.length===0)return!0;const{matrices:t,creases:n}=Et(e,0),o=new D,s=new D;for(const i of n)for(const r of i.seg)if(o.set(r[0],r[1],0).applyMatrix4(t[i.a]),s.set(r[0],r[1],0).applyMatrix4(t[i.b]),o.distanceTo(s)>ln)return!1;return!0},jn=(e,t)=>{var r;const n=((r=Qe(e,t))==null?void 0:r.angle)??180,s=(n<0?-1:1)*(Math.abs(Math.abs(n)-90)<1?45:90),i=e.overrides.filter(a=>!_e(a.point,t.seg));return i.push({point:on(t),angle:s}),Xe({facets:e.facets,overrides:i})},fn=.05,mt=.01,yt=.05,un=(e,t,n)=>{const o=k(n,e),s=k(n,t),i=O(e,t);if(o<=U&&s<=U)return 0;if(o>=-U&&s>=-U)return i;const r=o/(o-s),a=se(e,t,r);return o>0?O(e,a):O(a,t)},Me=(e,t)=>{const{from:n,to:o,sign:s}=t;if(O(n,o)<fn)return null;const i=ke(n,o),r=e.facets,a=r.length,c=Q(e),{compOf:l}=Ce(e,c);let u;if(t.fromPaper?u=r.findIndex(f=>Mt(f.poly,t.fromPaper)):(u=Ee(e,n,s,void 0,rn(e,c)),u===-1&&(u=Ee(e,n,s))),u===-1)return null;const d=l[u],m=r.map(oe),g=r.map(f=>ze(me(f.iso),i)),p=r.map(f=>Je(f.iso)?-1:1),h=r.map((f,y)=>pe(f.poly,g[y],p[y])),b=(f,y,B)=>f.reduce((R,P)=>Math.max(R,B*k(y,P)),0),M=f=>h[f].length>=3&&Math.abs(re(h[f]))>1e-4&&b(h[f],g[f],p[f])>yt,I=r.map((f,y)=>h[y].map(B=>W(f.iso,B)));if(!M(u))return null;const S=new Set,v=[u];for(;v.length>0;){const f=v.pop();if(!S.has(f)&&M(f)){S.add(f);for(const y of c){if(y.a!==f&&y.b!==f)continue;const B=y.a===f?y.b:y.a;if(S.has(B))continue;const R=W(r[f].iso,y.seg[0]),P=W(r[f].iso,y.seg[1]);if(un(R,P,i)>mt){if(l[B]!==d)return null;v.push(B)}}for(let y=0;y<a;y++)S.has(y)||l[y]!==d||s*(r[y].layer-r[f].layer)<=0||We(m[y],I[f])&&v.push(y)}}const A=ue(i),C=[],T=[],j=[];if(r.forEach((f,y)=>{if(!S.has(y)){T.push({...f,poly:f.poly}),j.push(l[y]);return}const{pos:B,neg:R}=Pe(f.poly,g[y]);let P=p[y]===1?B:R,N=p[y]===1?R:B;N&&b(N,g[y],-p[y])<yt&&(P=f.poly,N=null),P&&C.push({facet:{poly:P,iso:ne(A,f.iso),layer:f.layer},origLayer:f.layer}),N&&(T.push({poly:N,iso:f.iso,layer:f.layer}),j.push(l[y]))}),C.length===0||!j.includes(d))return null;const x=C.map(f=>oe(f.facet));for(const f of sn(e,c))if(l[f.a]===d!=(l[f.b]===d)){for(const y of x)if(Zt(f.seg[0],f.seg[1],y,.005)>mt)return null}let L=null;T.forEach((f,y)=>{if(j[y]!==d)return;const B=oe(f);x.some(P=>We(B,P))&&(L===null||s*f.layer>s*L)&&(L=f.layer)});const z=L===null?0:L+s,V=C.map(f=>f.origLayer),H=s===1?Math.max(...V):Math.min(...V);C.forEach(f=>{f.facet.layer=s===1?z+(H-f.origLayer):z-(f.origLayer-H)});const _=[...T,...C.map(f=>f.facet)];Lt(_),_t(_);const E={facets:_,overrides:e.overrides};if(!Xe(E))return null;const w=C.map((f,y)=>T.length+y);return{state:E,foldLine:i,movedFacets:w,params:t}},je=.02,Nn=(e,t,n)=>{const o=Me(e,t);if(o)return o;if(n===null)return null;const s=n.params.to,i=O(s,t.to);if(i<=je)return n;let r=n,a=0,c=1,l=je*2/i;for(;a+l<1;){const u=Me(e,{...t,to:se(s,t.to,a+l)});if(u)r=u,a=a+l,l*=2;else{c=a+l;break}}for(;(c-a)*i>je;){const u=(a+c)/2,d=Me(e,{...t,to:se(s,t.to,u)});d?(r=d,a=u):c=u}return r},Ye=.05,Ze=(e,t,n)=>{if(e.overrides.length===0)return!1;for(const o of t)if((n.has(o.a)||n.has(o.b))&&Qe(e,o))return!0;return!1},ie=(e,t)=>[W(e.facets[t.a].iso,t.seg[0]),W(e.facets[t.a].iso,t.seg[1])],dn=(e,t,n)=>{const o=k(n,e),s=k(n,t),i=O(e,t);if(o<=U&&s<=U)return 0;if(o>=-U&&s>=-U)return i;const r=o/(o-s),a=se(e,t,r);return o>0?O(e,a):O(a,t)},pn=(e,t)=>{const n=e.length,o=.02,s=(c,l)=>Ke(c.poly,l.poly).filter(u=>O(u[0],u[1])>o),i=Array.from({length:n},()=>[]);for(let c=0;c<n;c++)for(let l=c+1;l<n;l++)s(e[c],e[l]).length>0&&(i[c].push(l),i[l].push(c));const r=e.map(c=>c.reassigned?c.iso:null),a=[];for(e.forEach((c,l)=>{c.reassigned&&a.push(l)});a.length>0;){const c=a.shift();for(const l of i[c]){if(r[l]!==null||s(e[c],e[l]).every(h=>h.every(b=>O(W(r[c],b),W(e[l].iso,b))<.001)))continue;const m=t[e[c].sourceIdx],g=t[e[l].sourceIdx],p=ne(ne(r[c],me(m)),g);r[l]=p,e[l].iso=p,e[l].reassigned=!0,e[l].layer=e[c].layer+(e[l].oldLayer-e[c].oldLayer),a.push(l)}}return e.map(c=>({poly:c.poly,iso:c.iso,layer:c.layer}))},et=(e,t,n,o)=>{const s=pn(e,t);if(s===null)return null;Lt(s),_t(s);const i={facets:s,overrides:n};return an(i)!==null||!Xe(i)?null:{state:i,foldLine:o}},hn=(e,t)=>{const{grab:n,to:o,sign:s}=t;if(O(n,o)<Ye)return null;const i=ke(n,o),r=Ee(e,n,s);if(r===-1)return null;const a=e.facets,c=Q(e),l=a.map(v=>ze(me(v.iso),i)),u=a.map(v=>Je(v.iso)?-1:1),d=v=>{const A=pe(a[v].poly,l[v],u[v]);return A.length>=3?Math.abs(re(A)):0};if(d(r)<1e-4)return null;const m=new Set,g=[r];for(;g.length>0;){const v=g.pop();if(!(m.has(v)||d(v)<1e-4)){m.add(v);for(const A of c){if(A.a!==v&&A.b!==v)continue;const C=A.a===v?A.b:A.a;if(m.has(C))continue;const[T,j]=ie(e,A);dn(T,j,i)>U*100&&g.push(C)}}}if(Ze(e,c,m))return null;const p=ue(i),h=[],b=[];if(a.forEach((v,A)=>{if(!m.has(A)){h.push({poly:v.poly,iso:v.iso,layer:v.layer,oldLayer:v.layer,sourceIdx:A,reassigned:!1});return}const{pos:C,neg:T}=Pe(v.poly,l[A]),j=u[A]===1?C:T,x=u[A]===1?T:C;x&&h.push({poly:x,iso:v.iso,layer:v.layer,oldLayer:v.layer,sourceIdx:A,reassigned:!1}),j&&(h.push({poly:j,iso:ne(p,v.iso),layer:v.layer,oldLayer:v.layer,sourceIdx:A,reassigned:!0}),b.push(v.layer))}),b.length===0)return null;const M=Math.min(...b),I=Math.max(...b);if(M===I)return null;const S=I-M;return h.forEach(v=>{if(v.reassigned){const A=M+I-v.layer;v.layer=M+(A-M+1)*S/(S+2)}}),et(h,e.facets.map(v=>v.iso),e.overrides,i)},mn=(e,t)=>{const{grab:n,to:o,sign:s}=t,i=t.flip??!1;if(O(n,o)<Ye)return null;const r=Ee(e,n,s);if(r===-1)return null;const a=e.facets,c=Q(e);let l=null,u=1/0;for(const _ of c){if(_.a!==r&&_.b!==r)continue;const[E,w]=ie(e,_),f=Be(n,E,w);f<u&&(u=f,l=_)}if(!l)return null;const d=l.a===r?l.b:l.a,[m,g]=ie(e,l),[p,h]=O(m,n)<O(g,n)?[g,m]:[m,g],b=Ne(He(h,p)),M=Ne(He(o,p)),I=Ne([b[0]+M[0],b[1]+M[1]]);if(!isFinite(I[0])||Math.hypot(I[0],I[1])<U)return null;const S={p,d:I},v={p,d:M},A=ue(S),C=ue(v),T=i?ne(C,A):A,j=i?C:null;if(Ze(e,c,new Set([r,d])))return null;const x=Math.max(...a.map(_=>_.layer)),L=Math.min(...a.map(_=>_.layer)),z=_=>s===1?x+_:L-_,V=(_,E,w)=>i?z(_?E?3:4:E?2:1):_?E?z(1):w:z(E?2:3),H=[];for(let _=0;_<a.length;_++){const E=a[_];if(_!==r&&_!==d){H.push({poly:E.poly,iso:E.iso,layer:E.layer,oldLayer:E.layer,sourceIdx:_,reassigned:!1});continue}const w=ze(me(E.iso),S),{pos:f,neg:y}=Pe(E.poly,w);if(!f||!y)return null;const B=$e(l.seg[0],l.seg[1]),R=It(f,B),P=R?f:y,N=R?y:f,J=_===r;H.push({poly:P,iso:ne(T,E.iso),layer:V(J,!0,E.layer),oldLayer:E.layer,sourceIdx:_,reassigned:!0}),H.push({poly:N,iso:j?ne(j,E.iso):E.iso,layer:V(J,!1,E.layer),oldLayer:E.layer,sourceIdx:_,reassigned:j!==null})}return et(H,e.facets.map(_=>_.iso),e.overrides,S)},yn=(e,t)=>{const{grab:n,to:o,sign:s}=t;if(O(n,o)<Ye)return null;const i=e.facets.map((r,a)=>({i:a,f:r})).filter(({f:r})=>{const a=oe(r);return a.length>=3&&xn(a,n)}).sort((r,a)=>s===1?a.f.layer-r.f.layer:r.f.layer-a.f.layer);for(const{i:r}of i){const a=vn(e,r,n,o,s);if(a)return a}return null},gn=(e,t,n)=>{const o=(r,a)=>Math.abs(r.a-a.a)<1e-6&&Math.abs(r.b-a.b)<1e-6&&Math.abs(r.c-a.c)<1e-6&&Math.abs(r.d-a.d)<1e-6&&Math.abs(r.tx-a.tx)<.001&&Math.abs(r.ty-a.ty)<.001,s=new Set([n]),i=[n];for(;i.length>0;){const r=i.pop();for(const a of t){if(a.a!==r&&a.b!==r)continue;const c=a.a===r?a.b:a.a;s.has(c)||o(e.facets[r].iso,e.facets[c].iso)&&(s.add(c),i.push(c))}}return s},vn=(e,t,n,o,s)=>{const i=e.facets,r=Q(e),a=ke(n,o),c=ue(a),l=gn(e,r,t),u=[],d=w=>{u.some(f=>O(w,f)<U*1e3)||u.push(w)},m=(w,f)=>{for(const y of r){if(!l.has(y.a)||!l.has(y.b)||y.a!==f&&y.b!==f)continue;const B=ie(e,y);if(Be(w,B[0],B[1])<U*1e3)return!0}return!1};for(const w of l){const f=oe(i[w]);for(let y=0;y<f.length;y++){const B=f[y],R=f[(y+1)%f.length],P=k(a,B),N=k(a,R);let J=null;Math.abs(P)<U*100?J=B:(P>U&&N<-U||P<-U&&N>U)&&(J=se(B,R,P/(P-N))),J&&!m(J,w)&&d(J)}}if(u.length!==2)return null;const[g,p]=u,h=w=>{let f=null;for(const y of r){const B=l.has(y.a),R=l.has(y.b);if(B===R)continue;const P=ie(e,y);if(wn(w,P)){if(P.some(N=>k(a,N)>.01))return y;f=f??y}}return f},b=h(g),M=h(p);if(!b||!M||b===M)return null;const I=l.has(b.a)?b.b:b.a,S=l.has(M.a)?M.b:M.a;if(I===S)return null;const v=ie(e,b),A=ie(e,M);let C=null;for(const w of v)for(const f of A)O(w,f)<U*1e4&&(C=w);if(!C||k(a,C)<U)return null;const T=new Set([...l,I,S]);if(Ze(e,r,T))return null;const j=w=>oe(i[w]).every(f=>k(a,f)>-.01);if(!j(I)||!j(S))return null;const x=i.map(w=>w.iso),L=[],z=[];for(const w of l){const f=i[w],y=ze(me(f.iso),a),{pos:B,neg:R}=Pe(f.poly,y);if(!B||!R)return null;const P=Je(f.iso)?-1:1,N=P===1?B:R,J=P===1?R:B;L.push({poly:J,iso:f.iso,layer:f.layer,oldLayer:f.layer,sourceIdx:w,reassigned:!1}),z.push({poly:N,iso:ne(c,f.iso),oldLayer:f.layer,sourceIdx:w})}for(const w of[I,S]){const f=i[w];z.push({poly:f.poly,iso:ne(c,f.iso),oldLayer:f.layer,sourceIdx:w})}for(const w of[I,S])for(let f=0;f<i.length;f++){if(T.has(f))continue;const y=Ke(i[w].poly,i[f].poly).filter(P=>O(P[0],P[1])>.02);if(y.length===0)continue;if(!y.map(P=>P.map(N=>W(i[f].iso,N))).every(P=>P.every(N=>Math.abs(k(a,N))<.01)))return null;T.add(f),L.push({poly:i[f].poly,iso:i[f].iso,layer:i[f].layer,oldLayer:i[f].layer,sourceIdx:f,reassigned:!1})}const V=Math.max(...i.map(w=>w.layer)),H=Math.min(...i.map(w=>w.layer)),_=s===1?V+1:H-1,E=s===1?Math.max(...z.map(w=>w.oldLayer)):Math.min(...z.map(w=>w.oldLayer));for(const w of z)L.push({poly:w.poly,iso:w.iso,layer:_+s*Math.abs(E-w.oldLayer),oldLayer:w.oldLayer,sourceIdx:w.sourceIdx,reassigned:!0});return i.forEach((w,f)=>{T.has(f)||L.push({poly:w.poly,iso:w.iso,layer:w.layer,oldLayer:w.layer,sourceIdx:f,reassigned:!1})}),et(L,x,e.overrides,a)},xn=(e,t)=>{let n=!1;for(let o=0,s=e.length-1;o<e.length;s=o++){const[i,r]=e[o],[a,c]=e[s];r>t[1]!=c>t[1]&&t[0]<(a-i)*(t[1]-r)/(c-r)+i&&(n=!n)}return n?!0:It(e,t)},wn=(e,t)=>Be(e,t[0],t[1])<U*1e4,He=(e,t)=>[e[0]-t[0],e[1]-t[1]],Ne=e=>{const t=Math.hypot(e[0],e[1]);return[e[0]/t,e[1]/t]},Be=(e,t,n)=>{const o=He(n,t),s=Math.max(0,Math.min(1,((e[0]-t[0])*o[0]+(e[1]-t[1])*o[1])/(o[0]*o[0]+o[1]*o[1]))),i=[t[0]+o[0]*s,t[1]+o[1]*s];return O(e,i)},It=(e,t)=>{for(let n=0;n<e.length;n++)if(Be(t,e[n],e[(n+1)%e.length])<.005)return!0;return!1},bn=(e,t)=>{switch(t.type){case"simple":{const n=Me(e,{from:t.from,to:t.to,sign:t.sign,fromPaper:t.fromPaper});return n?n.state:null}case"reverse":{const n=hn(e,{grab:t.grab,to:t.to,sign:t.sign});return n?n.state:null}case"squash":{const n=mn(e,{grab:t.grab,to:t.to,sign:t.sign,flip:t.flip});return n?n.state:null}case"petal":{const n=yn(e,{grab:t.grab,to:t.to,sign:t.sign});return n?n.state:null}case"angle":return Sn(e,t.point,t.angle)}},Sn=(e,t,n)=>{const o=Q(e).find(i=>_e(t,i.seg));if(!o)return null;n=Math.max(-180,Math.min(180,n));const s=e.overrides.filter(i=>!_e(i.point,o.seg));return n<180&&s.push({point:t,angle:n}),{facets:e.facets,overrides:s}},Vn=(e,t)=>{let n=tn(e);for(const o of t){const s=bn(n,o);if(s===null)return null;n=s}return n},Mn=Vt,An=(e,t,n)=>t.clone().sub(e).cross(n.clone().sub(e)).length()*.5,Ln=(e,t,n,o)=>{const s=o.clone().sub(t),i=n.clone().sub(t),r=e.clone().sub(t),a=s.dot(s),c=s.dot(i),l=s.dot(r),u=i.dot(i),d=i.dot(r),m=1/(a*u-c*c),g=(u*l-c*d)*m,p=(a*d-c*l)*m;return g>=-1e-6&&p>=-1e-6&&g+p<=1+1e-6},_n=(e,t,n,o)=>{const s=[];return e.facets.forEach((i,r)=>{const a=t[r],c=new D(0,0,1).transformDirection(a),l=i.poly.map(([u,d])=>new D(u,d,0).applyMatrix4(a).multiplyScalar(o));for(let u=1;u+1<l.length;u++){const d=l[0],m=l[u],g=l[u+1],p=An(d,m,g);p!==0&&s.push({facet:r,component:n[r],a:d,b:m,c:g,centroid:d.clone().add(m).add(g).multiplyScalar(1/3),normal:c.clone(),area:p})}}),s},En=(e,t)=>{const n=[[.3333333333333333,.3333333333333333,.3333333333333333],[.6,.2,.2],[.2,.6,.2],[.2,.2,.6],[.45,.45,.1],[.45,.1,.45],[.1,.45,.45]];let o=0,s=0;for(const[i,r,a]of n){const c=e.a.clone().multiplyScalar(i).addScaledVector(e.b,r).addScaledVector(e.c,a);let l=!0,u=!0;for(const d of t){if(d.facet===e.facet||d.component!==e.component||Math.abs(d.normal.dot(e.normal))<.999)continue;const m=d.a.clone().sub(c).dot(e.normal);if(Math.abs(m)<1e-7)continue;const g=c.clone().addScaledVector(e.normal,m);Ln(g,d.a,d.b,d.c)&&(m>0?l=!1:u=!1)}l&&o++,u&&s++}return{positive:o/n.length,negative:s/n.length}},xe=(e,t,n,o)=>{e[0]+=t.x*n.x*o,e[1]+=t.x*n.y*o,e[2]+=t.x*n.z*o,e[3]+=t.y*n.x*o,e[4]+=t.y*n.y*o,e[5]+=t.y*n.z*o,e[6]+=t.z*n.x*o,e[7]+=t.z*n.y*o,e[8]+=t.z*n.z*o},In=(e,t,n)=>{const o=new Array(9).fill(0);for(const i of e){const r=i.area*n,a=i.a.clone().sub(t),c=i.b.clone().sub(t),l=i.c.clone().sub(t),u=a.clone().add(c).add(l);xe(o,a,a,r/12),xe(o,c,c,r/12),xe(o,l,l,r/12),xe(o,u,u,r/12)}const s=o[0]+o[4]+o[8];return new Wt().set(s-o[0],-o[1],-o[2],-o[3],s-o[4],-o[5],-o[6],-o[7],s-o[8])},zn=(e,t,n,o,s)=>Array.from({length:o},(i,r)=>{const a=t.filter(d=>d.component===r),c=a.reduce((d,m)=>d+m.area*s.paperAreaDensity,0),l=a.reduce((d,m)=>d.addScaledVector(m.centroid,m.area*s.paperAreaDensity),new D).multiplyScalar(1/c),u=a.flatMap(d=>[d.a.clone().sub(l),d.b.clone().sub(l),d.c.clone().sub(l)]);return{facetIndices:e.facets.flatMap((d,m)=>n[m]===r?[m]:[]),mass:c,center:l,inertia:In(a,l,s.paperAreaDensity),localVertices:u}}),Pn=(e,t,n,o,s)=>e.a!==t||e.b!==n||Math.abs(e.axis.dot(s))<.9999?!1:o.clone().sub(e.points[0]).cross(e.axis).length()<.003,gt=(e,t)=>{const n=e.clone().addScaledVector(t,-e.dot(t));return n.lengthSq()>1e-10?n.normalize():new D(0,1,0).addScaledVector(t,-t.y).normalize()},Dn=(e,t,n)=>Math.atan2(e.dot(t.clone().cross(n)),t.dot(n)),Cn=e=>{const t=new D(0,1,0).addScaledVector(e.normal,-e.normal.y);return t.lengthSq()>1e-10?t.normalize():[e.b.clone().sub(e.a),e.c.clone().sub(e.b),e.a.clone().sub(e.c)].sort((o,s)=>s.lengthSq()-o.lengthSq())[0].normalize()},Bn=(e,t,n,o,s)=>{const i=Q(e),r=De(e,i),a=[];return i.forEach((c,l)=>{if(r[l]===null||r[l]>=180)return;const u=o[c.a],d=o[c.b];if(u===d)return;const m=Math.min(u,d),g=Math.max(u,d),p=new D(c.seg[0][0],c.seg[0][1],0).applyMatrix4(t[c.a]).multiplyScalar(s),h=new D(c.seg[1][0],c.seg[1][1],0).applyMatrix4(t[c.a]).multiplyScalar(s),b=h.clone().sub(p).normalize();(b.x<-1e-8||Math.abs(b.x)<1e-8&&b.y<-1e-8)&&b.negate();let M=a.find(I=>Pn(I,m,g,p,b));M||(M={a:m,b:g,axis:b,points:[]},a.push(M)),M.points.push(p,h)}),a.map(c=>{const l=c.points[0],u=c.points.map(S=>S.clone().sub(l).dot(c.axis)),d=l.clone().addScaledVector(c.axis,Math.min(...u)),m=l.clone().addScaledVector(c.axis,Math.max(...u)),g=n[c.a].facetIndices[0],p=n[c.b].facetIndices[0],h=new D(0,0,1).transformDirection(t[g]),b=new D(0,0,1).transformDirection(t[p]),M=gt(h,c.axis),I=gt(b,c.axis);return{a:c.a,b:c.b,localA0:d.clone().sub(n[c.a].center),localA1:m.clone().sub(n[c.a].center),localB0:d.clone().sub(n[c.b].center),localB1:m.clone().sub(n[c.b].center),localAxisA:c.axis.clone(),referenceA:M,referenceB:I,restAngle:Dn(c.axis,M,I)}})},Un=(e,t,n,o,s)=>{const i=e.map(r=>{const a=En(r,e),c=Cn(r),l=r.normal.clone().cross(c).normalize(),u=r.centroid.clone().sub(t[r.component].center);return{component:r.component,position:u,forcePosition:u.clone(),normal:r.normal.clone(),chordDirection:c,spanDirection:l,area:r.area,chord:0,aspectRatio:1,exposurePositive:a.positive,exposureNegative:a.negative}});return t.forEach((r,a)=>{const c=i.filter(S=>S.component===a);if(c.length===0)return;const l=c[0].chordDirection,u=c[0].spanDirection;let d=1/0,m=-1/0,g=1/0,p=-1/0,h=0;for(const S of c){const v=S.position.clone().add(t[a].center),A=Math.sqrt(S.area/Math.PI);d=Math.min(d,v.dot(l)-A),m=Math.max(m,v.dot(l)+A),g=Math.min(g,v.dot(u)-A),p=Math.max(p,v.dot(u)+A),h+=S.area*(S.exposurePositive+S.exposureNegative)*.5}const b=Math.max(m-d,1e-4),M=Math.max(p-g,1e-4),I=Ge.clamp(M*M/Math.max(h,1e-8),o,s);c.forEach(S=>{S.chord=b,S.aspectRatio=I,S.forcePosition.copy(S.position).addScaledVector(S.chordDirection,b*n)})}),i.filter(r=>r.exposurePositive>0||r.exposureNegative>0)},Wn=(e,t,n)=>{const o=t.clone().normalize(),s=n.clone().projectOnPlane(o).normalize(),i=o.clone().cross(s).normalize();for(const r of e.samples){r.normal.dot(s)<-.05&&(r.normal.negate(),[r.exposurePositive,r.exposureNegative]=[r.exposureNegative,r.exposurePositive]);const a=o.clone().projectOnPlane(r.normal);a.lengthSq()>1e-10&&r.chordDirection.copy(a.normalize()),r.spanDirection.copy(r.normal).cross(r.chordDirection).normalize()}e.components.forEach((r,a)=>{const c=e.samples.filter(S=>S.component===a);if(c.length===0)return;const l=c[0].chordDirection,u=c[0].spanDirection;let d=1/0,m=-1/0,g=1/0,p=-1/0,h=0;for(const S of c){const v=S.position.clone().add(r.center),A=Math.sqrt(S.area/Math.PI);d=Math.min(d,v.dot(l)-A),m=Math.max(m,v.dot(l)+A),g=Math.min(g,v.dot(u)-A),p=Math.max(p,v.dot(u)+A),h+=S.area*(S.exposurePositive+S.exposureNegative)*.5}const b=Math.max(m-d,1e-4),M=Math.max(p-g,1e-4),I=Ge.clamp(M*M/Math.max(h,1e-8),e.minAspectRatio,e.maxAspectRatio);for(const S of c)S.chord=b,S.aspectRatio=I,S.forcePosition.copy(S.position).addScaledVector(S.chordDirection,b*e.aerodynamicCenter)}),e.aeroForward.copy(o),e.aeroUp.copy(s),e.aeroRight.copy(i),e.rollBiasCoefficient=0,e.yawBiasCoefficient=0,e.referenceArea=e.samples.reduce((r,a)=>r+a.area*(a.exposurePositive+a.exposureNegative)*.5,0),e.referenceChord=e.samples.reduce((r,a)=>{const c=(a.exposurePositive+a.exposureNegative)*.5;return r+a.area*c*a.chord},0)/Math.max(e.referenceArea,1e-8)},Hn=(e,t,n=Mn)=>{const{matrices:o}=Et(e,t),s=Q(e),i=Ce(e,s),r=i.compOf,a=_n(e,o,r,n.paperScale),c=zn(e,a,r,i.count,n),l=Bn(e,o,c,r,n.paperScale),u=Un(a,c,n.aerodynamicCenter,n.minAspectRatio,n.maxAspectRatio),d={state:e,components:c,hinges:l,samples:u,facetToComponent:r,facetMatrices:o,baseComponent:i.base,paperScale:n.paperScale,aerodynamicCenter:n.aerodynamicCenter,minAspectRatio:n.minAspectRatio,maxAspectRatio:n.maxAspectRatio,aeroForward:new D(0,1,0),aeroUp:new D(0,0,1),aeroRight:new D(1,0,0),referenceArea:u.reduce((m,g)=>m+g.area*(g.exposurePositive+g.exposureNegative)*.5,0),referenceChord:0,rollBiasCoefficient:0,yawBiasCoefficient:0};return d.referenceChord=u.reduce((m,g)=>{const p=(g.exposurePositive+g.exposureNegative)*.5;return m+g.area*p*g.chord},0)/Math.max(d.referenceArea,1e-8),d};export{Mn as D,bt as L,$t as a,Hn as b,Et as c,Rn as d,O as e,oe as f,W as g,Fn as h,Je as i,me as j,Nn as k,se as l,tn as m,bn as n,Q as o,Xt as p,jn as q,Vn as r,Wn as s,Qe as t,on as u};
