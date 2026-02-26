uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    luma = clamp((luma - 0.3) * 2.5, 0.0, 1.0);
    vec2 centered = v_textureCoordinates - 0.5;
    float vignette = 1.0 - smoothstep(0.35, 0.7, length(centered));
    out_FragColor = vec4(vec3(luma * vignette), 1.0);
}
