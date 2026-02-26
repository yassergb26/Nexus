uniform sampler2D colorTexture;
in vec2 v_textureCoordinates;

float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
    vec2 texel = 1.0 / vec2(textureSize(colorTexture, 0));

    float tl = luminance(texture(colorTexture, v_textureCoordinates + vec2(-texel.x, -texel.y)).rgb);
    float t  = luminance(texture(colorTexture, v_textureCoordinates + vec2(0.0,      -texel.y)).rgb);
    float tr = luminance(texture(colorTexture, v_textureCoordinates + vec2( texel.x, -texel.y)).rgb);
    float l  = luminance(texture(colorTexture, v_textureCoordinates + vec2(-texel.x,  0.0)).rgb);
    float r  = luminance(texture(colorTexture, v_textureCoordinates + vec2( texel.x,  0.0)).rgb);
    float bl = luminance(texture(colorTexture, v_textureCoordinates + vec2(-texel.x,  texel.y)).rgb);
    float b  = luminance(texture(colorTexture, v_textureCoordinates + vec2(0.0,       texel.y)).rgb);
    float br = luminance(texture(colorTexture, v_textureCoordinates + vec2( texel.x,  texel.y)).rgb);

    float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
    float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
    float edge = clamp(sqrt(gx*gx + gy*gy) * 3.0, 0.0, 1.0);

    vec4 color = texture(colorTexture, v_textureCoordinates);
    vec3 cel = floor(color.rgb * 4.0) / 4.0;
    float luma = luminance(cel);
    cel = mix(vec3(luma), cel, 1.6);
    out_FragColor = vec4(mix(cel, vec3(0.0), edge * 0.9), 1.0);
}
