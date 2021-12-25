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

void main(){

  vec2 texel = 1./vec2(screenWidth, screenHeight);
  vec2 shift;
  if(horizontal){
    shift = vec2(texel.x, 0);
  }else{
    shift = vec2(0, texel.y);
  }

  vec3 col = vec3(0);

  col += texture(tex, fragCoord).xyz* vec3(weightR[0],weightG[0],weightB[0]);

  for(int i = 1; i < kernelSize; i++){
    col += texture(tex, fragCoord+shift*float(i)).xyz * vec3(weightR[i],weightG[i],weightB[i]);
    col += texture(tex, fragCoord-shift*float(i)).xyz * vec3(weightR[i],weightG[i],weightB[i]);
  }
  fragColor = vec4(col.xyz, 1.);
}