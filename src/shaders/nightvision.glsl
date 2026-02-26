uniform sampler2D colorTexture;
uniform float u_time;
in vec2 v_textureCoordinates;

float rand(vec2 co) {
    return fract(sin(dot(co + u_time * 0.001, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float noise = rand(v_textureCoordinates) * 0.06;
    vec2 centered = v_textureCoordinates - 0.5;
    float vignette = 1.0 - smoothstep(0.3, 0.75, length(centered));
    float green = clamp(luma * 1.4 + noise, 0.0, 1.0) * vignette;
    out_FragColor = vec4(0.05, green, 0.07, 1.0);
}
