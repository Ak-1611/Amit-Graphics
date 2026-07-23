/* ==========================================================================
   THREE.JS HERO — "Registration" scene
   Floating print-plate layers (CMYK separation sheets) that drift and
   align, referencing the physical process of print registration.
   Fails silently (no console errors, no broken page) if Three.js
   doesn't load or WebGL isn't available.
   ========================================================================== */
(function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    canvas.style.display = 'none';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ambient + key light so plates read as flat colored sheets
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(4, 6, 8);
  scene.add(key);

  // CMYK-inspired plate colors, plus the brand coral + plum
  const plateColors = [0xff5a36, 0x2a1b3d, 0x6bb7ff, 0xf4e04d, 0xede7e0];
  const plates = [];
  const group = new THREE.Group();
  scene.add(group);

  const plateGeo = new THREE.PlaneGeometry(3.2, 4.2, 1, 1);

  plateColors.forEach((color, i) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(plateGeo, mat);

    // Scatter starting position/rotation — plates begin "unregistered"
    const angle = (i / plateColors.length) * Math.PI * 2;
    mesh.userData.startPos = new THREE.Vector3(
      Math.cos(angle) * 2.6,
      Math.sin(angle) * 1.6,
      -i * 0.6
    );
    mesh.userData.targetPos = new THREE.Vector3(0, 0, -i * 0.35);
    mesh.userData.startRot = (Math.random() - 0.5) * 0.9;
    mesh.position.copy(mesh.userData.startPos);
    mesh.rotation.z = mesh.userData.startRot;
    mesh.position.z += i * 0.01; // avoid z-fighting

    group.add(mesh);
    plates.push(mesh);
  });

  group.rotation.x = 0.15;

  // Scroll-driven registration progress (0 = scattered, 1 = aligned)
  let progress = 0;
  let targetProgress = 0;

  function updateScrollProgress() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    targetProgress = total > 0 ? scrolled / total : 0;
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smoothly ease progress toward target
    progress += (targetProgress - progress) * 0.06;

    plates.forEach((mesh, i) => {
      const p = mesh.userData;
      mesh.position.lerpVectors(p.startPos, p.targetPos, progress);
      mesh.rotation.z = p.startRot * (1 - progress);

      // gentle ambient float even at rest
      if (!reduceMotion) {
        mesh.position.y += Math.sin(t * 0.5 + i) * 0.01;
        mesh.rotation.y = Math.sin(t * 0.3 + i) * 0.05 * (1 - progress * 0.7);
      }
    });

    group.rotation.y = Math.sin(t * 0.08) * 0.08;

    renderer.render(scene, camera);
  }

  if (!reduceMotion) {
    animate();
  } else {
    // static single render, plates pre-aligned, respects reduced motion
    targetProgress = 1;
    progress = 1;
    plates.forEach((mesh) => mesh.position.copy(mesh.userData.targetPos));
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
