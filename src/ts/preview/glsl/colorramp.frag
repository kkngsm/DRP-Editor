in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D tex;
uniform bool horizontal;
uniform float weightR[13];
uniform float weightG[13];
uniform float weightB[13];
uniform int kernelSize;

vec3 colorRanpUnit(
        float x,
        float start_edge, vec3 start_col,
        float end_edge, vec3 end_col
    ){
    float value = (clamp(x, start_edge, end_edge)-start_edge)/(end_edge-start_edge);
    return mix(start_col, end_col, value);
}
void main(){

  vec3 col = vec3(weightR[0],weightG[0],weightB[0]);
  float x = fragCoord.x;
  float scale = 1. / float(kernelSize);
  for(int i = 0; i < kernelSize-1; i++){
    float fi = float(i);
    vec3 end_col = vec3(weightR[i],weightG[i],weightB[i]);
    col = colorRanpUnit(x, scale*fi, col, scale*(fi+1.), end_col);
  }
  fragColor = vec4(col.xyz, 1.);
}