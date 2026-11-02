import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/*
 * Hero scene: three plywood steps rise from a speckled floor (问题 → 原型 → 产品),
 * then a yellow ball — the idea — hops from its spool up to the top step.
 */

const figure = document.querySelector('[data-scene]');
const card = figure?.querySelector('.scene-card');
const canvas = card?.querySelector('canvas');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const FLOOR = '#dcd9d3';
const STEP = 1.2;
const CAP = 0.035;
const R = 0.24;
const STEPS = [
  { x: -1.21, h: 0.55, paint: '#f3f1ec' },
  { x: 0, h: 1.05, paint: '#b9f2ac' },
  { x: 1.21, h: 1.6, paint: '#1a1a18' },
];
const SPOOL = { x: -2.55, z: 0.55, r: 0.36, h: 0.34 };

const easeOutBack = t => { const c = 1.35; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const easeInQuad = t => t * t;
const clamp01 = t => Math.min(1, Math.max(0, t));

function plywoodTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 1024;
  const g = c.getContext('2d');
  // Plies of uneven thickness: smooth face veneer alternating with darker, speckled end grain
  let y = 0, i = 0;
  while (y < c.height) {
    const ph = 26 + Math.random() * 22;
    const face = i++ % 2 === 0;
    const j = (Math.random() - 0.5) * 12;
    g.fillStyle = face ? `rgb(${222 + j},${182 + j},${126 + j})` : `rgb(${196 + j},${150 + j},${96 + j})`;
    g.fillRect(0, y, c.width, ph);
    for (let k = 0; k < 30; k++) {
      g.fillStyle = Math.random() < 0.55 ? `rgba(130,86,44,${Math.random() * 0.1})` : `rgba(255,246,226,${Math.random() * 0.16})`;
      g.fillRect(0, y + Math.random() * ph, c.width, 0.5 + Math.random() * 1.5);
    }
    if (!face) {
      for (let k = 0; k < 220; k++) {
        g.fillStyle = `rgba(110,72,36,${0.08 + Math.random() * 0.18})`;
        g.fillRect(Math.random() * c.width, y + Math.random() * ph, 1 + Math.random() * 2, 1);
      }
    }
    g.fillStyle = 'rgba(96,60,26,.45)';
    g.fillRect(0, y, c.width, 1.5);
    y += ph;
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function speckleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = FLOOR;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const r = Math.random();
    g.fillStyle = r < 0.62 ? `rgba(78,72,64,${0.25 + Math.random() * 0.45})` : r < 0.85 ? `rgba(150,142,130,${0.4 + Math.random() * 0.4})` : 'rgba(255,255,255,.75)';
    g.beginPath();
    g.arc(Math.random() * 512, Math.random() * 512, 0.4 + Math.random() * 1.1, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function contactShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,.55)');
  grad.addColorStop(0.55, 'rgba(0,0,0,.18)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FLOOR);
  scene.fog = new THREE.Fog(FLOOR, 22, 34);

  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
  const target = new THREE.Vector3(-0.3, 0.7, 0.15);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.add(new THREE.HemisphereLight('#ffffff', '#cfc6b8', 0.7));
  const sun = new THREE.DirectionalLight('#fff4e4', 2.4);
  sun.position.set(4.5, 9, -5.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
  sun.shadow.radius = 7;
  sun.shadow.blurSamples = 20;
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  const floorTex = speckleTexture();
  floorTex.repeat.set(10, 10);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 1, envMapIntensity: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ply = plywoodTexture();
  const contact = contactShadowTexture();
  const plyMaterial = height => {
    const map = ply.clone();
    map.needsUpdate = true;
    map.repeat.set(1, height / 0.78);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.8, envMapIntensity: 0.35 });
  };
  const contactShadow = size => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: contact, transparent: true, depthWrite: false, opacity: 0.55 })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.002;
    return m;
  };

  // Steps
  const stepMeshes = [];
  const steps = STEPS.map((s, i) => {
    const group = new THREE.Group();
    group.position.set(s.x, 0, 0);
    const riser = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(STEP, s.h, STEP, 4, 0.04), plyMaterial(s.h));
    body.position.y = s.h / 2;
    const cap = new THREE.Mesh(
      new RoundedBoxGeometry(STEP - 0.006, CAP, STEP - 0.006, 3, 0.014),
      new THREE.MeshStandardMaterial({ color: s.paint, roughness: i === 2 ? 0.45 : 0.6, envMapIntensity: 0.3 })
    );
    cap.position.y = s.h + CAP / 2 - 0.006;
    for (const m of [body, cap]) { m.castShadow = m.receiveShadow = true; m.userData.step = i; }
    riser.add(body, cap);
    group.add(contactShadow(STEP * 1.5), riser);
    scene.add(group);
    stepMeshes.push(body, cap);
    return { ...s, group, riser, lift: 0, liftTarget: 0, rise: 0 };
  });

  // Spool the idea starts from
  const spool = new THREE.Group();
  spool.position.set(SPOOL.x, 0, SPOOL.z);
  const spoolRiser = new THREE.Group();
  const spoolBody = new THREE.Mesh(
    new THREE.CylinderGeometry(SPOOL.r, SPOOL.r, SPOOL.h, 64),
    [plyMaterial(SPOOL.h), new THREE.MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.6 }), plyMaterial(SPOOL.h)]
  );
  spoolBody.position.y = SPOOL.h / 2;
  spoolBody.castShadow = spoolBody.receiveShadow = true;
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.13, 48), new THREE.MeshStandardMaterial({ color: '#ffe100', roughness: 0.5 }));
  dot.rotation.x = -Math.PI / 2;
  dot.position.y = SPOOL.h + 0.002;
  spoolRiser.add(spoolBody, dot);
  spool.add(contactShadow(SPOOL.r * 3.2), spoolRiser);
  scene.add(spool);

  // The idea
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 48),
    new THREE.MeshPhysicalMaterial({ color: '#ffd200', emissive: '#ffb800', emissiveIntensity: 0.12, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: 0.45 })
  );
  ball.castShadow = true;
  ball.visible = false;
  scene.add(ball);

  // Anchors: where the ball rests on each surface
  const stepTop = i => {
    const s = steps[i];
    return new THREE.Vector3(s.x, s.lift + (s.h + CAP - 0.006) * s.riser.scale.y + R, 0);
  };
  const spoolTop = () => new THREE.Vector3(SPOOL.x, SPOOL.h * spoolRiser.scale.y + R, SPOOL.z);
  const sky = () => spoolTop().add(new THREE.Vector3(0, 4.5, 0));

  // Ball choreography as a queue of segments
  let segments = [];
  let landedAt = -10;
  let restOn = spoolTop;
  const queueHops = (t0, from) => {
    const path = [spoolTop, () => stepTop(0), () => stepTop(1), () => stepTop(2)];
    let t = t0;
    if (from) { segments.push({ from, to: spoolTop, t0: t, dur: 0.85, arc: 1.5 }); t += 0.85 + 0.3; }
    for (let i = 0; i < 3; i++) {
      segments.push({ from: path[i], to: path[i + 1], t0: t, dur: 0.52, arc: 0.85 });
      t += 0.52 + 0.2;
    }
    return t;
  };

  // Camera fitting and parallax
  const view = { az: 0.72, el: 0.5, azT: 0.72, elT: 0.5, dist: 17 };
  const resize = () => {
    const w = card.clientWidth, h = card.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    view.dist = 16 / Math.min(1, camera.aspect * 1.15);
    camera.updateProjectionMatrix();
  };
  const placeCamera = () => {
    const d = view.dist;
    camera.position.set(
      target.x + d * Math.cos(view.el) * Math.sin(view.az),
      target.y + d * Math.sin(view.el),
      target.z + d * Math.cos(view.el) * Math.cos(view.az)
    );
    camera.lookAt(target);
  };
  new ResizeObserver(resize).observe(card);
  resize();

  const hero = document.querySelector('.hero');
  if (finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      view.azT = 0.72 + (e.clientX / innerWidth - 0.5) * 0.22;
      view.elT = 0.5 - (e.clientY / innerHeight - 0.5) * 0.1;
    });
  }

  // Hover lifts a step
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = -1;
  const callouts = [...card.querySelectorAll('.callout')];
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(stepMeshes)[0];
    hovered = hit ? hit.object.userData.step : -1;
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { hovered = -1; });

  // Replay
  const replay = card.querySelector('.replay');
  let busyUntil = 0;
  const now = () => (performance.now() - start) / 1000;
  const doReplay = () => {
    const t = now();
    if (t < busyUntil || reduceMotion) return;
    const from = restOn;
    segments = [];
    busyUntil = queueHops(t, from);
  };
  replay?.addEventListener('click', doReplay);
  canvas.addEventListener('click', doReplay);

  // Callout projection: pinned to the back edge of each top surface so the ball never covers them
  const anchors = [
    () => spoolTop().add(new THREE.Vector3(0, -R, -0.2)),
    ...steps.map((_, i) => () => stepTop(i).add(new THREE.Vector3(0, -R, -0.42))),
  ];
  const v = new THREE.Vector3();
  const placeCallouts = () => {
    const w = card.clientWidth, h = card.clientHeight;
    anchors.forEach((fn, i) => {
      v.copy(fn());
      v.project(camera);
      callouts[i].style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
      callouts[i].classList.toggle('is-hot', i - 1 === hovered);
    });
  };

  // Timeline
  let start = performance.now();
  const RISE = [0.25, 0.42, 0.59];
  const DROP_AT = 1.35;
  segments.push({ from: sky, to: spoolTop, t0: DROP_AT, dur: 0.55, drop: true });
  busyUntil = queueHops(DROP_AT + 0.55 + 0.45);
  if (reduceMotion) { start -= 60000; busyUntil = 0; }

  let ready = false;
  const tick = () => {
    const t = now();

    spoolRiser.scale.y = Math.max(0.001, easeOutBack(clamp01(t / 0.7)));
    steps.forEach((s, i) => {
      s.riser.scale.y = Math.max(0.001, easeOutBack(clamp01((t - RISE[i]) / 0.85)));
      s.liftTarget = i === hovered ? 0.16 : 0;
      s.lift += (s.liftTarget - s.lift) * (reduceMotion ? 1 : 0.14);
      s.group.position.y = s.lift;
    });

    // Ball
    const seg = segments.find(sg => t >= sg.t0 && t < sg.t0 + sg.dur);
    const done = segments.filter(sg => t >= sg.t0 + sg.dur);
    if (seg) {
      ball.visible = true;
      const p = (t - seg.t0) / seg.dur;
      const a = seg.from(), b = seg.to();
      if (seg.drop) {
        ball.position.lerpVectors(a, b, easeInQuad(p));
      } else {
        ball.position.lerpVectors(a, b, p);
        ball.position.y += 4 * seg.arc * p * (1 - p);
      }
      seg.landed = false;
    } else if (done.length) {
      const last = done.reduce((x, y) => (x.t0 > y.t0 ? x : y));
      if (!last.landed) { last.landed = true; landedAt = t; restOn = last.to; }
      ball.visible = true;
      ball.position.copy(restOn());
    }
    const k = Math.exp(-(t - landedAt) * 8) * Math.cos((t - landedAt) * 22) * 0.24;
    ball.scale.set(1 + k * 0.5, 1 - k, 1 + k * 0.5);
    ball.position.y -= k * R;

    view.az += (view.azT - view.az) * 0.05;
    view.el += (view.elT - view.el) * 0.05;
    placeCamera();
    renderer.render(scene, camera);
    placeCallouts();

    if (!ready && t > busyUntil) { ready = true; card.classList.add('is-ready'); }
  };

  let running = false;
  const loop = () => { if (!running) return; tick(); requestAnimationFrame(loop); };
  const setRunning = on => {
    if (on === running) return;
    running = on;
    if (on) requestAnimationFrame(loop);
  };
  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; setRunning(inView && !document.hidden); }).observe(card);
  document.addEventListener('visibilitychange', () => setRunning(inView && !document.hidden));

  tick();
  card.classList.add('is-live');
  setRunning(true);
}

if (canvas) {
  try {
    init();
  } catch (err) {
    console.warn('Hero scene unavailable, showing still image.', err);
    card.classList.add('is-static');
  }
}
