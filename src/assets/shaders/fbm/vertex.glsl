uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vGlobalPosition;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    vGlobalPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
}