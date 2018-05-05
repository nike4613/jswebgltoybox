#ifdef GL_FRAGMENT_SHADER_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;

void main() {
  float max = max(uResolution.x, uResolution.y);
  gl_FragColor = vec4(gl_FragCoord.xy / max, 0.0, 1.0);
}