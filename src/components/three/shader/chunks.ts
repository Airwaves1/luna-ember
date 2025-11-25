// GLSL Shader Chunks as TypeScript strings

export const PI = `
const float PI = 3.141592653589793;
`;

export const rotate = `
mat2 rotate(float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat2(
    c, s,
    -s, c
  );
}
`;

export const noise = `
float rand (vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}
float anime(float f){
  float speed = 2.0;
  return sin(f * 10. + uTime * speed) * 0.5;
}
float noise(vec2 uv){
  float o = anime(rand(vUv));
  return o;
}
`;

export const cellNoise = `
// https://thebookofshaders.com/12/
vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
vec3 cellNoise(vec2 st){
  vec3 color = vec3(0.0);
  st *= 2.0;
  st.x *= uAspect;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);
  float m_dist = 1.;
  float t = uTime * 0.5;
  for (int y= -1; y <= 1; y++) {
    for (int x= -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x),float(y));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5*sin(t + 6.2831*point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      m_dist = min(m_dist, dist);
    }
  }
  color += m_dist;
  return color;
}
`;

export const clipBorderRadius = `
float clipBorderRadius(
  vec2 uv, vec2 resolution, float borderRadius
){
  borderRadius = min(borderRadius, min(resolution.x, resolution.y) * 0.5);

  float clip;
  float biggerResolution = max(resolution.x, resolution.y);
  vec2 aspect = resolution / biggerResolution;

  // 4つ角を四角形でクリップできるようにuvを調整する
  vec2 clipSquareUv = uv - 0.5; 
  // クリップする四角形の範囲を1/4にする
  vec2 clipRange = 0.5 - (vec2(borderRadius) / resolution);
  vec2 clipSquare = smoothstep(
    vec2(clipRange), 
    vec2(clipRange - 0.001), 
    abs(clipSquareUv)
  );
  clip = min(1.0, clipSquare.x + clipSquare.y);

  // 4つ角を丸くクリップする
  float radius = borderRadius / biggerResolution;
  vec2 clipCircleUv = abs(uv - 0.5);
  clipCircleUv = (clipCircleUv - 0.5) * aspect + radius;
  float clipBorderRadius = smoothstep(
    radius + 0.001, 
    radius, 
    length(clipCircleUv)
  );

  // 四角と丸から角丸を抽出する
  clip = min(1.0, clip + clipBorderRadius);
  return clip;
}
`;

// Blend modes
export const blendLinearDodge = `
float blendLinearDodge(float base, float blend) {
	// Note : Same implementation as BlendAddf
	return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendAdd
	return min(base+blend,vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
	return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const blendLinearBurn = `
float blendLinearBurn(float base, float blend) {
	// Note : Same implementation as BlendSubtractf
	return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendSubtract
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
	return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const blendAdd = `
float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const blendOverlay = `
float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const blendPhoenix = `
vec3 blendPhoenix(vec3 base, vec3 blend) {
	return min(base,blend)-max(base,blend)+vec3(1.0);
}

vec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {
	return (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));
}
`;

export const blendLinearLight = `
// #include "./linear-dodge.glsl"
// #include "./linear-burn.glsl"

float blendLinearLight(float base, float blend) {
	return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
	return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
	return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}
`;
