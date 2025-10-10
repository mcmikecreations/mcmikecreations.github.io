import * as THREE from 'three';

export interface TileMaterialParameters {
	uvFromPosition: boolean;
	includeDisplacement: boolean;
	colorFromUv: boolean;
	diffuseTexture: THREE.Texture;
	displacementTexture: THREE.Texture;
	tOffset: number;
	tTileSize: number;
	tScale: number;
	depthTest?: boolean;
}

export class TileMaterial extends THREE.ShaderMaterial {
	constructor(parameters: TileMaterialParameters) {
		const vertexShader = `
				uniform sampler2D tDisplacement;
				uniform float tScale;
				uniform float tTileSize;
				uniform float tOffset;
				out vec2 tuv;
				void main()	{
				  //tuv = uv;
					tuv = ${parameters.uvFromPosition ? 'clamp(position.xy / tTileSize + vec2(0.5, 0.5), 0.0, 1.0)' : 'uv'};
					vec4 color = texture2D(tDisplacement, tuv) * 256.0;
					// height in meters
					float height = -10000.0 + ((color.r * 256.0 * 256.0 + color.g * 256.0 + color.b) * 0.1);
					gl_Position = projectionMatrix
						* modelViewMatrix
						* vec4(position.x, position.y, position.z + ${parameters.includeDisplacement ? 'height' : '0.0'} * tScale + tOffset, 1.0)
						+ vec4(0.0, 0.0, -tOffset * 0.1, 0.0);
				}
				`;
		const fragmentShader = `
				uniform sampler2D tDiffuse;
				in vec2 tuv;
				void main() {
					gl_FragColor = ${parameters.colorFromUv ? 'vec4(tuv.x, tuv.y, 0.0, 1.0)' : 'vec4(texture2D(tDiffuse, tuv))'};
				}
				`;

		super({
			uniforms: {
				tScale: { value: parameters.tScale },
				tTileSize: { value: parameters.tTileSize },
				tOffset: { value: parameters.tOffset },
				tDisplacement: { value: parameters.displacementTexture },
				tDiffuse: { value: parameters.diffuseTexture }
			},
			depthTest: parameters.depthTest ?? true,
			vertexShader,
			fragmentShader,
		});
	}
}