in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;

uniform sampler2D tex;
uniform float col;
void main(){
  vec4 col = texture(tex, fragCoord);
  fragColor = vec4(col.xyz, 1.);
}