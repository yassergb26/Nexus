uniform sampler2D colorTexture;
uniform float u_time;
in vec2 v_textureCoordinates;

vec2 barrelDistort(vec2 uv, float k) {
    vec2 c = uv - 0.5;
    float r2 = dot(c, c);
    return uv + c * (k * r2);
}

void main() {
    vec2 uv = barrelDistort(v_textureCoordinates, 0.1);
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        out_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    float r = texture(colorTexture, uv + vec2(0.0015, 0.0)).r;
    float g = texture(colorTexture, uv).g;
    float b = texture(colorTexture, uv - vec2(0.0015, 0.0)).b;
    float scanline = 1.0 - 0.12 * step(0.5, fract(uv.y * 600.0));
    float flicker = 0.97 + 0.03 * sin(u_time * 7.3);
    out_FragColor = vec4(vec3(r, g, b) * scanline * flicker, 1.0);
}
