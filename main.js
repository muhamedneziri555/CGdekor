import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Scene Setup ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 2);
scene.add(light);

// --- Load Textures ---
const textureLoader = new THREE.TextureLoader();
const textures = [
  textureLoader.load('./assets/Doormate_metallicRoughness.png'),
  textureLoader.load('./assets/Doormate_baseColor.png'),
  textureLoader.load('./assets/Doormate_normal.png')
];

// --- Load Carpet Model using OBJLoader ---
const objLoader = new OBJLoader();
let carpet;
objLoader.load('./assets/Doormate.obj', (object) => {
  carpet = object;
  carpet.scale.set(3, 3, 3);
  carpet.position.set(0, 0, 0);
  
  // Apply a default MeshStandardMaterial with the first texture.
  carpet.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: textures[0],
        color: new THREE.Color(0xffffff)
      });
      child.material.needsUpdate = true;
    }
  });
  
  scene.add(carpet);
});

// --- Orbit Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- Functions to Change Texture & Color ---
// Change texture based on button press (index: 1, 2, or 3)
function changeTexture(index) {
  if (carpet) {
    carpet.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.map = textures[index - 1];
        child.material.needsUpdate = true;
      }
    });
  }
}

// Change the material's base color (e.g., "#ff0000" for red)
function changeColor(colorValue) {
  if (carpet) {
    carpet.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.set(colorValue);
        child.material.needsUpdate = true;
      }
    });
  }
}

// Expose functions globally for UI usage
window.changeTexture = changeTexture;
window.changeColor = changeColor;

// --- Render Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
