in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D rawTex;
uniform sampler2D maskTex;
uniform bool horizontal;
uniform float weightR[13];
uniform float weightG[13];
uniform float weightB[13];
uniform int kernelSize;

void main(){

  vec2 texel = 1./vec2(screenWidth, screenHeight);
  vec2 shift;
  if(horizontal){
    shift = vec2(texel.x, 0);
  }else{
    shift = vec2(0, texel.y);
  }

  vec3 col = vec3(0);
  vec3 centerCol = texture(rawTex, fragCoord).xyz;
  col += centerCol* vec3(weightR[0],weightG[0],weightB[0]);

  for(int i = 1; i < kernelSize; i++){
    vec2 pos = fragCoord+shift*float(i);
    col += mix(
      centerCol,
      texture(rawTex, pos).xyz,
      1.
    ) * vec3(weightR[i],weightG[i],weightB[i]);
    pos = fragCoord-shift*float(i);
    col += mix(
      centerCol,
      texture(rawTex, pos).xyz,
      1.
    ) * vec3(weightR[i],weightG[i],weightB[i]);
  }
  fragColor = vec4(mix(
    centerCol,
    col,
    texture(maskTex, fragCoord).x
  ), 1.);
}