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
  textureLoader.load('./assets/Doormate_metallicRoughness.png'), // Carpet 1
  textureLoader.load('./assets/Doormate_baseColor.png'),         // Carpet 2
  textureLoader.load('./assets/Doormate_normal.png')             // Carpet 3
];

// --- Load Carpet Model (OBJ) ---
const objLoader = new OBJLoader();
let carpet;
objLoader.load('./assets/Doormate.obj', (object) => {
  carpet = object;
  carpet.scale.set(3, 3, 3);
  
  // Default: use Carpet 1 (textures[0])
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

// --- changeTexture: Switch among the 3 carpets ---
function changeTexture(index) {
  if (!carpet) return;

  carpet.traverse((child) => {
    if (child.isMesh && child.material) {
      // Apply the selected texture
      child.material.map = textures[index - 1];
      child.material.needsUpdate = true;
      // Reset color to white (so the texture is visible)
      child.material.color.set(0xffffff);
    }
  });

  // Update the product panel text based on the chosen carpet
  const detailsEl = document.getElementById('texture-details');
  switch (index) {
    case 1:
      // Carpet 1
      if (detailsEl) {
        detailsEl.textContent = "Carpet 1: Dimensions: 1.50 x 2.20 m, Material: Polyester";
      }
      break;
    case 2:
      // Carpet 2
      if (detailsEl) {
        detailsEl.textContent = "Carpet 2: Dimensions: 2.00 x 3.00 m, Material: Cotton";
      }
      break;
    case 3:
      // Carpet 3
      if (detailsEl) {
        detailsEl.textContent = "Carpet 3: Dimensions: 1.75 x 2.50 m, Material: Wool";
      }
      break;
    default:
      if (detailsEl) {
        detailsEl.textContent = "";
      }
  }
}

// --- changeColor: If "Red Carpet" is pressed ---
function changeColor(colorValue) {
  if (!carpet) return;

  carpet.traverse((child) => {
    if (child.isMesh && child.material) {
      // Remove any texture map
      child.material.map = null;
      child.material.color.set(colorValue);
      child.material.needsUpdate = true;
    }
  });

  // Update text to reflect a "Red Carpet"
  const detailsEl = document.getElementById('texture-details');
  if (detailsEl) {
    detailsEl.textContent = "Red Carpet: Dimensions: 1.60 x 2.30 m, Material: Polyester (Red Finish)";
  }
}

// Expose functions globally
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

// --- Add to Cart Button ---
const addToCartBtn = document.getElementById('add-to-cart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    alert('Carpet added to cart!');
  });
}
