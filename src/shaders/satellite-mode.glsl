uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    vec3 sat = mix(vec3(luma), color.rgb, 1.45);
    sat = clamp((sat - 0.5) * 1.18 + 0.5, 0.0, 1.0);
    sat *= vec3(0.94, 0.97, 1.06);
    out_FragColor = vec4(sat, color.a);
}
