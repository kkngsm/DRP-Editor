in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;

void main(){
  fragColor = vec4(fragCoord, 0,1);
}