export { card_vertex_shader, card_fragment_shader };


const card_vertex_shader = /*glsl*/ `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const card_fragment_shader = /*glsl*/ `
    uniform sampler2D frontTex;
    uniform sampler2D backTex;
    varying vec2 vUv;
    void main() {
        if (gl_FrontFacing) {
            gl_FragColor = texture2D(backTex, vUv);
        } else {
            gl_FragColor = texture2D(frontTex, vec2(1.0 - vUv.x, vUv.y));
        }
    }
`;