uniform vec3 uColor;

varying vec4 vAlpha;

void main()
{
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.1;

    gl_FragColor = vec4(uColor, strength * vAlpha);
}