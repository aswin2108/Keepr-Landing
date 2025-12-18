import * as THREE from 'three';

let camera, scene, renderer;
let coreGroup;

export function initScene() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    scene = new THREE.Scene();
    // Void Black Fog for depth
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.035);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4.5;

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- THE SECURE CORE VISUAL ---
    coreGroup = new THREE.Group();

    // 1. Inner "Data" Nucleus (Solid w/ wireframe overlay)
    const nucleusGeom = new THREE.IcosahedronGeometry(0.8, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({
        color: 0x00ff9d,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
    coreGroup.add(nucleus);

    // 2. Middle "Shield" Layer (Denser Wireframe)
    const shieldGeom = new THREE.IcosahedronGeometry(1.4, 1);
    const shieldMat = new THREE.LineBasicMaterial({ color: 0x00cc7a }); // Slightly darker mint
    const shield = new THREE.LineSegments(
        new THREE.WireframeGeometry(shieldGeom),
        shieldMat
    );
    coreGroup.add(shield);

    // 3. Outer "Encryption" Shell (Floating Particles/Points)
    const outerGeom = new THREE.IcosahedronGeometry(2.2, 1);
    const outerVertices = outerGeom.attributes.position;
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute('position', outerVertices);
    const particlesMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    const particleShell = new THREE.Points(particlesGeom, particlesMat);
    coreGroup.add(particleShell);

    scene.add(coreGroup);

    // Handle Resize
    window.addEventListener('resize', onWindowResize);

    animate();
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    if (!container || !camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (coreGroup) {
        // Autonomous, Hypnotic Rotation
        // Different layers could rotate differently if they were separate meshes,
        // but rotating the group gives a solid "Unit" feel.

        // Let's rotate the individual components for a more complex "working machine" feel
        const nucleus = coreGroup.children[0];
        const shield = coreGroup.children[1];
        const shell = coreGroup.children[2];

        nucleus.rotation.y -= 0.005;
        nucleus.rotation.z += 0.002;

        shield.rotation.y += 0.003;
        shield.rotation.x -= 0.001;

        shell.rotation.y -= 0.001; // Slow drift for outer shell
    }

    renderer.render(scene, camera);
}
