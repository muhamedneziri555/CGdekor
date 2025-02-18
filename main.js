import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* -------------------------------------------------
   TEXTURES (adjust paths to your actual files)
---------------------------------------------------*/
const textureLoader = new THREE.TextureLoader();
const TEXTURES = [
  textureLoader.load('./assets/Doormate_metallicRoughness.png'), // Carpet 1
  textureLoader.load('./assets/Doormate_baseColor.png'),         // Carpet 2
  textureLoader.load('./assets/Doormate_normal.png'),            // Carpet 3
  textureLoader.load('./assets/Carpet4.png')                     // Carpet 4 (example)
];

/* -------------------------------------------------
   1) HOME PAGE (Single Carpet) 
   - One scene/camera, big full-page canvas (#home-canvas)
---------------------------------------------------*/
let homeScene, homeCamera, homeRenderer, homeControls;
let singleCarpet = null;

// Initialize Single-Carpet Scene
function initHomeScene() {
  console.log("Initializing home scene...");
  const canvas = document.getElementById('home-canvas');
  homeScene = new THREE.Scene();

  // Camera
  homeCamera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  // Position it so the carpet isn't huge
  homeCamera.position.set(1, 3, 5);

  // Renderer
  homeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  homeRenderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Orbit Controls
  homeControls = new OrbitControls(homeCamera, canvas);
  homeControls.enableDamping = true;
  homeControls.minDistance = 70;
  homeControls.maxDistance = 100;

  // Lighting
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(2, 2, 2);
  homeScene.add(dirLight);

  // Load OBJ
  const loader = new OBJLoader();
  loader.load(
    './assets/Doormate.obj',
    (obj) => {
      console.log("Home OBJ loaded successfully.");
      singleCarpet = obj;
      // Scale so it appears normal
      singleCarpet.scale.set(3, 3, 3);

      // Default texture is TEXTURES[0]
      singleCarpet.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: TEXTURES[0],
            color: 0xffffff
          });
        }
      });

      homeScene.add(singleCarpet);
    },
    undefined,
    (error) => {
      console.error("Error loading Home OBJ:", error);
    }
  );
}

/* Change texture (single carpet) */
window.changeTexture = function(index) {
  if (!singleCarpet) return;
  singleCarpet.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.map = TEXTURES[index - 1];
      child.material.color.set(0xffffff);
      child.material.needsUpdate = true;
    }
  });

  // Update text
  const detailsEl = document.getElementById('texture-details');
  if (!detailsEl) return;
  switch (index) {
    case 1:
      detailsEl.textContent = "Carpet 1: Dimensions: 1.50 x 2.20 m, Material: Polyester";
      break;
    case 2:
      detailsEl.textContent = "Carpet 2: Dimensions: 2.00 x 3.00 m, Material: Cotton";
      break;
    case 3:
      detailsEl.textContent = "Carpet 3: Dimensions: 1.75 x 2.50 m, Material: Wool";
      break;
    default:
      detailsEl.textContent = "Unknown Carpet";
  }
};

/* Change color (single carpet) */
window.changeColor = function(colorValue) {
  if (!singleCarpet) return;
  singleCarpet.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.map = null; // remove texture
      child.material.color.set(colorValue);
      child.material.needsUpdate = true;
    }
  });
  const detailsEl = document.getElementById('texture-details');
  if (detailsEl) {
    detailsEl.textContent = "Red Carpet: Dimensions: 1.60 x 2.30 m, Material: Polyester (Red Finish)";
  }
};

/* -------------------------------------------------
   2) PRODUCTS PAGE (4 Smaller Carpets in a Row)
   - 4 Scenes/Cameras, each bound to a <canvas> 
     (#carpetCanvas1 ... #carpetCanvas4)
---------------------------------------------------*/
const multiViewers = []; // store 4 viewers

function initProductsScene() {
  console.log("Initializing products scene...");
  for (let i = 1; i <= 4; i++) {
    createCarpetViewer(i);
  }
}

// Create a single "viewer" for the i-th carpet
function createCarpetViewer(i) {
  const canvas = document.getElementById(`carpetCanvas${i}`);
  if (!canvas) return;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  // narrower FOV for a 220x220 canvas
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 1, 3);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Orbit Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minDistance = 1.5;
  controls.maxDistance = 4;

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 2, 2);
  scene.add(light);

  // OPTIONAL: Add a faint ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  // Add a small test box so we can confirm the scene is working
  const testGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const testMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const testBox = new THREE.Mesh(testGeo, testMat);
  testBox.position.set(-1, 0, 0);
  scene.add(testBox);

  // Load the texture for this carpet
  const texIndex = i - 1; 
  const texture = TEXTURES[texIndex] || TEXTURES[0];

  // Load OBJ
  const loader = new OBJLoader();
  loader.load(
    './assets/Doormate.obj',
    (obj) => {
      console.log(`Product carpet ${i} OBJ loaded successfully.`);
      // Scale for a 220x220 card
      obj.scale.set(1.0, 1.0, 1.0);

      // Apply texture
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff
          });
        }
      });

      scene.add(obj);
      multiViewers[i - 1].model = obj; // store reference
    },
    undefined,
    (error) => {
      console.error(`Error loading Product OBJ #${i}:`, error);
    }
  );

  // Store the viewer
  multiViewers[i - 1] = {
    scene,
    camera,
    renderer,
    controls,
    model: null
  };
}

/* -------------------------------------------------
   3) SHOW/HIDE VIEWS
   - We'll toggle #home-view and #products-view
---------------------------------------------------*/
window.showHome = function() {
  document.getElementById('products-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
};

window.showProducts = function() {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('products-view').style.display = 'block';
};

/* -------------------------------------------------
   4) ANIMATION LOOP
   - Render the single carpet
   - Render each of the 4 carpets
   - Rotate them slowly
---------------------------------------------------*/
function animate() {
  requestAnimationFrame(animate);

  // SINGLE CARPET
  if (homeScene && homeRenderer && homeControls) {
    homeControls.update();
    homeRenderer.render(homeScene, homeCamera);
  }

  // MULTI CARPETS
  multiViewers.forEach((viewer) => {
    if (!viewer) return;
    const { scene, camera, renderer, controls, model } = viewer;
    if (model) {
      model.rotation.y += 0.01; // rotate the carpet
    }
    controls.update();
    renderer.render(scene, camera);
  });
}
animate();

/* -------------------------------------------------
   5) RESIZE HANDLING
---------------------------------------------------*/
window.addEventListener('resize', () => {
  // Home view
  if (homeCamera && homeRenderer) {
    const canvas = document.getElementById('home-canvas');
    homeCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    homeCamera.updateProjectionMatrix();
    homeRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  // Product carpets
  multiViewers.forEach((viewer, i) => {
    if (!viewer) return;
    const canvas = document.getElementById(`carpetCanvas${i + 1}`);
    if (!canvas) return;
    viewer.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    viewer.camera.updateProjectionMatrix();
    viewer.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
});

/* -------------------------------------------------
   6) INIT ON PAGE LOAD
---------------------------------------------------*/
initHomeScene();
initProductsScene();

// Add-to-cart button (single view)
const addToCartBtn = document.getElementById('add-to-cart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    alert('Carpet added to cart!');
  });
}
