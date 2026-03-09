import * as THREE from 'three';
import { OBJLoader }      from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFExporter }    from 'three/addons/exporters/GLTFExporter.js';

/* ═══════════════════════════════════════════
   Organelle Data
   ═══════════════════════════════════════════ */
const ORGANELLES = [
  {
    num: 1, name: 'Dinding Sel', sub: 'Cell Wall',
    pos: [0, -10, 118], icon: '🧱', color: '#4CAF50',
    desc: 'Lapisan terluar sel tumbuhan yang kaku dan keras, memberikan bentuk dan perlindungan.',
    detail: [
      'Terbuat dari selulosa yang sangat kuat',
      'Melindungi dan menjaga bentuk sel tetap kotak',
      'Hanya dimiliki sel tumbuhan, tidak ada di sel hewan'
    ]
  },
  {
    num: 2, name: 'Membran Sel', sub: 'Cell Membrane',
    pos: [-65, 22, 85], icon: '🫧', color: '#26C6DA',
    desc: 'Lapisan tipis yang menyelimuti seluruh isi sel, seperti pintu gerbang.',
    detail: [
      'Mengatur zat yang boleh masuk dan keluar sel',
      'Bersifat semipermeabel (hanya zat tertentu bisa lewat)',
      'Terletak tepat di bawah dinding sel'
    ]
  },
  {
    num: 3, name: 'Sitoplasma', sub: 'Cytoplasm',
    pos: [-40, 22, 55], icon: '🫠', color: '#8BC34A',
    desc: 'Cairan kental seperti jeli yang mengisi hampir seluruh ruang sel.',
    detail: [
      'Tempat semua organel sel berada',
      'Membantu proses reaksi kimia dalam sel',
      'Terdiri dari 70-80% air'
    ]
  },
  {
    num: 4, name: 'Nukleus', sub: 'Nucleus',
    pos: [55, 75, 0], icon: '🧠', color: '#42A5F5',
    desc: 'Pusat kendali sel yang mengatur semua aktivitas, seperti otak.',
    detail: [
      'Menyimpan DNA yang berisi informasi genetik',
      'Mengatur pertumbuhan dan pembelahan sel',
      'Dikelilingi oleh selubung nukleus (membran inti)'
    ]
  },
  {
    num: 5, name: 'Mitokondria', sub: 'Mitochondria',
    pos: [-20, 22, -35], icon: '⚡', color: '#FFC107',
    desc: 'Organel penghasil energi untuk sel, disebut pembangkit listrik sel.',
    detail: [
      'Mengubah glukosa menjadi energi (ATP)',
      'Punya DNA sendiri yang unik',
      'Jumlahnya bisa ratusan dalam satu sel'
    ]
  },
  {
    num: 6, name: 'Retikulum Endoplasma', sub: 'Endoplasmic Reticulum',
    pos: [25, 22, 40], icon: '🛤️', color: '#FF7043',
    desc: 'Jaringan membran berlipat-lipat untuk transportasi zat dalam sel.',
    detail: [
      'Ada 2 jenis: RE Kasar (ditempeli ribosom) dan RE Halus',
      'RE Kasar membantu membuat protein',
      'RE Halus membuat lipid dan detoksifikasi'
    ]
  }
];

/* ═══════════════════════════════════════════
   Scene Setup
   ═══════════════════════════════════════════ */
const canvas   = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

/* ── Render-on-demand flag ─────────────── */
let needsRender = true;
function requestRender() { needsRender = true; }

const scene  = new THREE.Scene();
scene.background = new THREE.Color(0xf2f7f2);

const camera = new THREE.PerspectiveCamera(40, 1, 1, 2000);
camera.position.set(0, 80, 280);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping  = true;
controls.dampingFactor  = 0.08;
controls.target.set(0, 0, 0);
controls.minDistance = 80;
controls.maxDistance = 600;
controls.addEventListener('change', requestRender);

/* ── CSS2D Label Renderer ──────────────── */
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position      = 'absolute';
labelRenderer.domElement.style.top           = '0';
labelRenderer.domElement.style.left          = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('viewer-wrap').appendChild(labelRenderer.domElement);

/* ═══════════════════════════════════════════
   Lighting
   ═══════════════════════════════════════════ */
const ambientLight = new THREE.AmbientLight(0xd6f5c0, 0.7);
const sunLight     = new THREE.DirectionalLight(0xfff4d0, 2.2);
sunLight.position.set(200, 400, 150);
const backLight    = new THREE.DirectionalLight(0x80d040, 0.5);
backLight.position.set(-150, 100, -200);
const pointLight   = new THREE.PointLight(0x66bb33, 1.0, 800, 1.0);
pointLight.position.set(-80, 60, 120);
scene.add(ambientLight, sunLight, backLight, pointLight);

/* ═══════════════════════════════════════════
   Textures & Materials
   ═══════════════════════════════════════════ */
const texLoader = new THREE.TextureLoader();
const maxAniso  = renderer.capabilities.getMaxAnisotropy();
function loadTex(url) {
  const t = texLoader.load(url, requestRender);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter  = THREE.LinearMipmapLinearFilter;
  t.magFilter  = THREE.LinearFilter;
  t.anisotropy = maxAniso;
  return t;
}
const texDiffuse  = loadTex('Plant Cell/PlantCell-Diffuse.png');
const texMembrane = loadTex('Plant Cell/PlantCellMembrian.png');
const texNormal   = loadTex('Plant Cell/plant_cell_normal_map.tga.png');

const matCell = new THREE.MeshStandardMaterial({
  map: texDiffuse,
  normalMap: texNormal,
  roughness: 0.45,
  metalness: 0.05,
  emissive: new THREE.Color(0x0d2200),
  emissiveIntensity: 0.4
});

const matMembrane = new THREE.MeshStandardMaterial({
  map: texMembrane,
  normalMap: texNormal,
  roughness: 0.3,
  metalness: 0.08,
  transparent: true,
  opacity: 0.22,
  side: THREE.DoubleSide,
  depthWrite: false
});

/* ═══════════════════════════════════════════
   Load OBJ Models
   ═══════════════════════════════════════════ */
const objLoader = new OBJLoader();
const models    = [null, null];
let loadedCount = 0;

function centerAndFit(obj) {
  const box    = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  obj.position.sub(center);
}

function onModelLoaded() {
  if (++loadedCount < 2) return;
  document.getElementById('loading').style.display = 'none';
  rebuildMeshCache();
  createLabels();
  requestRender();
  setTimeout(() => {
    const hint = document.getElementById('controls-hint');
    if (hint) hint.style.opacity = '0';
  }, 5000);
}

function loadModel(url, material, index) {
  objLoader.load(
    url,
    obj => {
      obj.traverse(c => { if (c.isMesh) c.material = material; });
      centerAndFit(obj);
      if (index === 1) obj.position.y += 20;
      scene.add(obj);
      models[index] = obj;
      onModelLoaded();
    },
    xhr => {
      if (xhr.total) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        document.getElementById('progress-bar').style.width = pct + '%';
        document.getElementById('load-label').textContent = 'Memuat model… ' + pct + '%';
      }
    }
  );
}

loadModel('Plant Cell/model_0.obj', matCell, 0);
loadModel('Plant Cell/model_1.obj', matMembrane, 1);

/* ═══════════════════════════════════════════
   3D Labels (CSS2D)
   ═══════════════════════════════════════════ */
const labels3D = [];
const labelEls = [];
let labelsVisible = true;

function createLabels() {
  ORGANELLES.forEach(o => {
    const el = document.createElement('div');
    el.className = 'label3d';
    el.style.setProperty('--lc', o.color);
    el.innerHTML =
      `<span class="lnum">${o.num}</span>` +
      `<span class="lname">${o.icon} ${o.name}</span>`;
    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      showInfo(o);
      flyToOrganelle(o);
    });
    const css2d = new CSS2DObject(el);
    css2d.position.set(...o.pos);
    scene.add(css2d);
    labels3D.push(css2d);
    labelEls.push(el);
  });
}

/* ═══════════════════════════════════════════
   Label Occlusion Check
   ═══════════════════════════════════════════ */
/* ── Cached mesh list for raycasting ──── */
let cachedMeshes = [];
function rebuildMeshCache() {
  cachedMeshes = [];
  scene.traverse(c => { if (c.isMesh) cachedMeshes.push(c); });
}

const occRaycaster = new THREE.Raycaster();
const _labelWorldPos = new THREE.Vector3();
const _occDir = new THREE.Vector3();

function updateLabelOcclusion() {
  if (!labelsVisible || !cachedMeshes.length) return;

  const camPos = camera.position;
  let changed = false;

  labels3D.forEach((css2d, i) => {
    css2d.getWorldPosition(_labelWorldPos);
    _occDir.subVectors(_labelWorldPos, camPos);
    const dist = _occDir.length();
    _occDir.divideScalar(dist);
    occRaycaster.set(camPos, _occDir);
    occRaycaster.far = dist;
    const hits = occRaycaster.intersectObjects(cachedMeshes, false);
    const occluded = hits.length > 0 && hits[0].distance < dist - 10;
    const newOp = occluded ? '0.15' : '1';
    if (labelEls[i].style.opacity !== newOp) {
      labelEls[i].style.opacity = newOp;
      changed = true;
    }
  });

  if (changed) requestRender();
}

/* ═══════════════════════════════════════════
   Camera Fly-To Animation
   ═══════════════════════════════════════════ */
let flyAnim = null;

function flyToOrganelle(o) {
  const targetPos = new THREE.Vector3(...o.pos);
  const dir = targetPos.clone().normalize();
  const camDest = targetPos.clone().add(dir.multiplyScalar(120));
  camDest.y += 40;

  const startPos    = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime   = performance.now();
  const duration    = 800;

  if (flyAnim) cancelAnimationFrame(flyAnim);

  function step() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    camera.position.lerpVectors(startPos, camDest, ease);
    controls.target.lerpVectors(startTarget, targetPos, ease);
    controls.update();
    requestRender();

    if (t < 1) {
      flyAnim = requestAnimationFrame(step);
    } else {
      flyAnim = null;
    }
  }
  step();
}

/* ═══════════════════════════════════════════
   Info Popup
   ═══════════════════════════════════════════ */
function showInfo(o) {
  const popup = document.getElementById('info-popup');
  popup.style.setProperty('--popup-color', o.color);
  document.getElementById('popup-icon').textContent = o.icon;
  document.getElementById('popup-num').textContent  = o.num;
  document.getElementById('popup-name').textContent = o.name;
  document.getElementById('popup-sub').textContent  = o.sub;
  document.getElementById('popup-desc').textContent = o.desc;
  document.getElementById('popup-detail').innerHTML =
    o.detail.map(d => '<li>' + d + '</li>').join('');
  popup.classList.add('visible');
}

function closeInfo() {
  document.getElementById('info-popup').classList.remove('visible');
}

/* ═══════════════════════════════════════════
   Controls & Settings
   ═══════════════════════════════════════════ */
function toggleLabels() {
  labelsVisible = !labelsVisible;
  labels3D.forEach(l => { l.visible = labelsVisible; });
  document.getElementById('btn-labels').classList.toggle('active', labelsVisible);
  requestRender();
}

function toggleSettings() {
  document.getElementById('settingsPanel').classList.toggle('hidden');
}

function toggleLayer(i) {
  if (!models[i]) return;
  models[i].visible = !models[i].visible;
  document.getElementById('layer-' + i).classList.toggle('active', models[i].visible);
  requestRender();
}

function setAmbient(v) {
  ambientLight.intensity = +v;
  document.getElementById('v-amb').textContent = (+v).toFixed(2);
  requestRender();
}

function setDirectional(v) {
  sunLight.intensity = +v;
  document.getElementById('v-dir').textContent = (+v).toFixed(2);
  requestRender();
}

function setEnv(v) {
  renderer.toneMappingExposure = +v;
  document.getElementById('v-env').textContent = (+v).toFixed(2);
  requestRender();
}

function resetCamera() {
  camera.position.set(0, 80, 280);
  controls.target.set(0, 0, 0);
  controls.update();
  requestRender();
}

function focusOrganelle(num) {
  const o = ORGANELLES.find(x => x.num === num);
  if (!o) return;
  showInfo(o);
  flyToOrganelle(o);
}

/* ═══════════════════════════════════════════
   GLB Export
   ═══════════════════════════════════════════ */
function exportGLB() {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    result => {
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'plant-cell.glb';
      a.click();
      URL.revokeObjectURL(url);
    },
    err => console.error('Export error:', err),
    { binary: true }
  );
}

/* ═══════════════════════════════════════════
   Shift+Click Debugger
   ═══════════════════════════════════════════ */
const raycaster = new THREE.Raycaster();
canvas.addEventListener('click', e => {
  // Close settings panel when clicking on the canvas
  const sp = document.getElementById('settingsPanel');
  if (!sp.classList.contains('hidden')) {
    sp.classList.add('hidden');
  }
  if (!e.shiftKey) return;
  const rect  = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width)  *  2 - 1,
    -((e.clientY - rect.top) / rect.height) *  2 + 1
  );
  raycaster.setFromCamera(mouse, camera);
  const meshes = [];
  scene.traverse(c => { if (c.isMesh) meshes.push(c); });
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length) {
    const p = hits[0].point;
    console.log(`Shift+Click: [${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}]`);
  }
});

/* ═══════════════════════════════════════════
   Resize
   ═══════════════════════════════════════════ */
let resizeTimer;
function resize() {
  const wrap = document.getElementById('viewer-wrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  requestRender();
}
function debouncedResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 100);
}
window.addEventListener('resize', debouncedResize);
new ResizeObserver(debouncedResize).observe(document.getElementById('viewer-wrap'));
resize();

/* ═══════════════════════════════════════════
   Animation Loop
   ═══════════════════════════════════════════ */
/* ── Throttled occlusion (every 200ms) ── */
setInterval(updateLabelOcclusion, 200);

/* ── Render loop (on-demand) ───────────── */
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (needsRender) {
    needsRender = false;
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}
animate();

/* ═══════════════════════════════════════════
   Expose Functions for HTML onclick Handlers
   ═══════════════════════════════════════════ */
Object.assign(window, {
  toggleLabels, exportGLB, toggleSettings,
  toggleLayer, setAmbient, setDirectional, setEnv,
  resetCamera, focusOrganelle, closeInfo
});
