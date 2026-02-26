uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;

vec3 thermalColor(float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.25) return mix(vec3(0.0, 0.0, 0.2), vec3(0.0, 0.0, 1.0), t * 4.0);
    if (t < 0.5)  return mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), (t - 0.25) * 4.0);
    if (t < 0.75) return mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.5) * 4.0);
    return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.75) * 4.0);
}

void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    out_FragColor = vec4(thermalColor(luma), 1.0);
}
