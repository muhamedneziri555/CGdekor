import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/* -------------------------------------------------
   TEXTURES (Update paths as needed)
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
---------------------------------------------------*/
let homeScene, homeCamera, homeRenderer, homeControls;
let singleCarpet = null;

function initHomeScene() {
  console.log("Initializing home scene...");
  const canvas = document.getElementById('home-canvas');
  homeScene = new THREE.Scene();
  
  // Home camera
  homeCamera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  // Position the camera so the model appears properly sized
  homeCamera.position.set(0, 3, 10);
  
  homeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  homeRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
  
  homeControls = new OrbitControls(homeCamera, canvas);
  homeControls.enableDamping = true;
  homeControls.minDistance = 70;
  homeControls.maxDistance = 100;
  
  // Lighting for home scene
  const dirLight = new THREE.DirectionalLight(0xffffff, 2);
  dirLight.position.set(2, 2, 2);
  homeScene.add(dirLight);
  
  const loader = new OBJLoader();
  loader.load(
    './assets/Doormate.obj',
    (obj) => {
      console.log("Home OBJ loaded successfully.");
      singleCarpet = obj;
      
      // Center the model using its bounding box
      const box = new THREE.Box3().setFromObject(singleCarpet);
      const center = box.getCenter(new THREE.Vector3());
      singleCarpet.position.sub(center);
      
      // Adjust scale for home view
      singleCarpet.scale.set(3, 3, 3);
      
      // Apply default texture (Carpet 1)
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

/* Change texture (for home view) */
window.changeTexture = function(index) {
  if (!singleCarpet) return;
  singleCarpet.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.map = TEXTURES[index - 1];
      child.material.color.set(0xffffff);
      child.material.needsUpdate = true;
    }
  });
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

window.changeColor = function(colorValue) {
  if (!singleCarpet) return;
  singleCarpet.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.map = null;
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
   2) PRODUCTS PAGE (4 Smaller Carpets)
---------------------------------------------------*/
const multiViewers = []; // Array to store each product viewer

function initProductsScene() {
  console.log("Initializing products scene...");
  for (let i = 1; i <= 4; i++) {
    createCarpetViewer(i);
  }
}

function createCarpetViewer(i) {
  const canvas = document.getElementById(`carpetCanvas${i}`);
  if (!canvas) return;
  
  const scene = new THREE.Scene();
  
  // Adjusted camera for product view: move further back so model is visible
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(0, 0, 5);
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minDistance = 1.5;
  controls.maxDistance = 6;
  
  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 2, 2);
  scene.add(light);
  
  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);
  
  // Add a small test box to confirm the scene (red cube)
  const testGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const testMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const testBox = new THREE.Mesh(testGeo, testMat);
  testBox.position.set(-1, 0, 0);
  scene.add(testBox);
  
  // Load the texture for this product carpet
  const texIndex = i - 1;
  const texture = TEXTURES[texIndex] || TEXTURES[0];
  
  const loader = new OBJLoader();
  loader.load(
    './assets/Doormate.obj',
    (obj) => {
      console.log(`Product carpet ${i} OBJ loaded successfully.`);
      
      // Center the model
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      
      // Adjust scale for product view (tweak if needed)
      obj.scale.set(1.0, 1.0, 1.0);
      
      // Apply the product texture
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff
          });
        }
      });
      
      scene.add(obj);
      multiViewers[i - 1].model = obj;
    },
    undefined,
    (error) => {
      console.error(`Error loading Product OBJ #${i}:`, error);
    }
  );
  
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
---------------------------------------------------*/
window.showHome = function() {
  document.getElementById('products-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
};

window.showProducts = function() {
  document.getElementById('home-view').style.display = 'none';
  document.getElementById('products-view').style.display = 'block';
  
  // Force update each product canvas after it's visible
  multiViewers.forEach((viewer, i) => {
    const canvas = document.getElementById(`carpetCanvas${i + 1}`);
    if (canvas) {
      viewer.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      viewer.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      viewer.camera.updateProjectionMatrix();
    }
  });
};

/* -------------------------------------------------
   4) ANIMATION LOOP (Static Models)
---------------------------------------------------*/
function animate() {
  requestAnimationFrame(animate);
  
  // Render Home view
  if (homeScene && homeRenderer && homeControls) {
    homeControls.update();
    homeRenderer.render(homeScene, homeCamera);
  }
  
  // Render each product view (static; no rotation added)
  multiViewers.forEach((viewer) => {
    if (!viewer) return;
    viewer.controls.update();
    viewer.renderer.render(viewer.scene, viewer.camera);
  });
}
animate();

/* -------------------------------------------------
   5) RESIZE HANDLING
---------------------------------------------------*/
window.addEventListener('resize', () => {
  // Home view resize
  const homeCanvas = document.getElementById('home-canvas');
  if (homeCamera && homeRenderer && homeCanvas) {
    homeCamera.aspect = homeCanvas.clientWidth / homeCanvas.clientHeight;
    homeCamera.updateProjectionMatrix();
    homeRenderer.setSize(homeCanvas.clientWidth, homeCanvas.clientHeight);
  }
  
  // Products view resize
  multiViewers.forEach((viewer, i) => {
    const canvas = document.getElementById(`carpetCanvas${i + 1}`);
    if (viewer && canvas) {
      viewer.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      viewer.camera.updateProjectionMatrix();
      viewer.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
  });
});

/* -------------------------------------------------
   6) INIT ON PAGE LOAD
---------------------------------------------------*/
initHomeScene();
initProductsScene();

const addToCartBtn = document.getElementById('add-to-cart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    alert('Carpet added to cart!');
  });
}
