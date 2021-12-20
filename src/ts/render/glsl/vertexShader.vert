out vec2 fragCoord;
void main()
{
    fragCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}