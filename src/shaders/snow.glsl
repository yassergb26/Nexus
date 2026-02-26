uniform sampler2D colorTexture;
uniform float u_time;
in vec2 v_textureCoordinates;

float rand(vec2 co, float t) {
    return fract(sin(dot(co * t, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float noise = rand(v_textureCoordinates, floor(u_time * 15.0)) * 0.18;
    float scanline = step(0.5, fract(v_textureCoordinates.y * 600.0)) * 0.03;
    out_FragColor = vec4(color.rgb * (0.85 - scanline) + noise, color.a);
}
