#ifdef GL_FRAGMENT_SHADER_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

//uniform vec2 uResolution;
varying lowp vec4 vColor;

void main() {
  //float max = max(uResolution.x, uResolution.y);
  gl_FragColor = vColor;
}