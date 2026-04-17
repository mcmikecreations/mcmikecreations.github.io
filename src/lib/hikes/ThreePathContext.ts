import * as THREE from 'three';

export class ThreePathContext {
	paths: THREE.Path[];
	currentPath?: THREE.Path;
	bounds?: { x: number, y: number, width: number, height: number };

	constructor(bounds?: { x: number, y: number, width: number, height: number }) {
		this.paths = [];
		this.bounds = bounds;
	}

	initPath() {
		if (this.currentPath === undefined) {
			this.currentPath = new THREE.Path();
			this.paths.push(this.currentPath);
		}
	}
	arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void {
		this.initPath();
		// Since we flip y, we keep anticlockwise.
		this.currentPath?.arc(x, y, radius, startAngle, endAngle, !(anticlockwise ?? false));
	}

	beginPath(): void {
		this.initPath();
	}

	closePath(): void {
		this.currentPath = undefined;
	}

	lineTo(x: number, y: number): void {
		this.initPath();
		if (this.currentPath?.currentPoint && this.bounds) {
			const p = this.currentPath.currentPoint;
			const eps = 1e-9;
			const isVertical = Math.abs(x - p.x) < eps;
			const isHorizontal = Math.abs(y - p.y) < eps;
			const onLeft = Math.abs(x - this.bounds.x) < eps;
			const onRight = Math.abs(x - (this.bounds.x + this.bounds.width)) < eps;
			const onTop = Math.abs(y - this.bounds.y) < eps;
			const onBottom = Math.abs(y - (this.bounds.y + this.bounds.height)) < eps;

			if ((isVertical && (onLeft || onRight)) || (isHorizontal && (onTop || onBottom))) {
				this.moveTo(x, y);
				return;
			}
		}
		this.currentPath?.lineTo(x, y);
	}

	moveTo(x: number, y: number): void {
		if (this.currentPath && this.currentPath.curves.length > 0) {
			this.currentPath = undefined;
		}
		this.initPath();
		this.currentPath?.moveTo(x, y);
	}
}
