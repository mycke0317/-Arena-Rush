
import * as THREE from 'three';

export function startBattle(container) {
  container.innerHTML = `
    <div class="battle-screen">
      <div class="battle-score">🔵 BLUE 0 : 0 RED 🔴</div>
      <div class="battle-world"></div>
      <div class="battle-joystick">
        <div class="battle-stick"></div>
      </div>
      <button class="battle-attack">공격</button>
      <button class="battle-super">특수</button>
      <button class="battle-exit">나가기</button>
    </div>
  `;

  const screen = container.querySelector('.battle-screen');
  const world = screen.querySelector('.battle-world');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x80c95c);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 16, 12);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  world.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x557744, 2));

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(5, 12, 5);
  scene.add(light);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0x75bd55 })
  );
  floor.position.y = -0.2;
  scene.add(floor);

  const grid = new THREE.GridHelper(20, 20, 0x4e9140, 0x65a94b);
  scene.add(grid);

  function makeCharacter(color, x, z) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 0.5, 5, 12),
      new THREE.MeshStandardMaterial({ color })
    );
    body.position.y = 0.8;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd09a })
    );
    head.position.y = 1.55;
    group.add(head);

    group.position.set(x, 0, z);
    scene.add(group);
    return group;
  }

  function makeWall(x, z) {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.3, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x98704b })
    );
    wall.position.set(x, 0.65, z);
    scene.add(wall);
  }

  makeWall(-3, -2);
  makeWall(3, 2);
  makeWall(-3, 3);
  makeWall(3, -3);

  const player = makeCharacter(0x2589ee, -5, 0);

  const enemies = [
    makeCharacter(0xe94b45, 5, -3),
    makeCharacter(0xe94b45, 5, 0),
    makeCharacter(0xe94b45, 5, 3)
  ];

  const allies = [
    makeCharacter(0x2589ee, -6, -3),
    makeCharacter(0x2589ee, -6, 3)
  ];

  let bullets = [];
  let moveX = 0;
  let moveZ = 0;
  let pointer = null;
  let running = true;

  const joystick = screen.querySelector('.battle-joystick');
  const stick = screen.querySelector('.battle-stick');

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();
    let x = event.clientX - rect.left - 55;
    let y = event.clientY - rect.top - 55;

    const length = Math.hypot(x, y);
    if (length > 38) {
      x = x / length * 38;
      y = y / length * 38;
    }

    moveX = x / 38;
    moveZ = y / 38;

    stick.style.transform = `translate(${x}px, ${y}px)`;
  }

  joystick.addEventListener('pointerdown', event => {
    pointer = event.pointerId;
    joystick.setPointerCapture(pointer);
    updateJoystick(event);
  });

  joystick.addEventListener('pointermove', event => {
    if (event.pointerId === pointer) updateJoystick(event);
  });

  function stopMove() {
    pointer = null;
    moveX = 0;
    moveZ = 0;
    stick.style.transform = 'translate(0, 0)';
  }

  joystick.addEventListener('pointerup', stopMove);
  joystick.addEventListener('pointercancel', stopMove);

  function fire() {
    if (!enemies.length) return;

    const target = enemies.reduce((nearest, enemy) => {
      return player.position.distanceTo(enemy.position) <
        player.position.distanceTo(nearest.position)
        ? enemy : nearest;
    });

    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffed45 })
    );

    bullet.position.copy(player.position);
    bullet.position.y = 1;

    const direction = new THREE.Vector3()
      .subVectors(target.position, player.position)
      .normalize();

    scene.add(bullet);
    bullets.push({ mesh: bullet, direction, life: 2 });
  }

  screen.querySelector('.battle-attack')
    .addEventListener('pointerdown', event => {
      event.preventDefault();
      fire();
    });

  screen.querySelector('.battle-super')
    .addEventListener('pointerdown', event => {
      event.preventDefault();
      player.scale.set(1.5, 1.5, 1.5);
      setTimeout(() => player.scale.set(1, 1, 1), 500);
    });

  const clock = new THREE.Clock();

  function resize() {
    const width = world.clientWidth;
    const height = world.clientHeight;
    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', resize);
  resize();

  function animate() {
    if (!running) return;

    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.04);

    player.position.x += moveX * 4 * dt;
    player.position.z += moveZ * 4 * dt;

    player.position.x = THREE.MathUtils.clamp(player.position.x, -8, 8);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -8, 8);

    for (const bullet of bullets) {
      bullet.mesh.position.addScaledVector(bullet.direction, 8 * dt);
      bullet.life -= dt;
    }

    bullets = bullets.filter(bullet => {
      if (bullet.life <= 0) {
        scene.remove(bullet.mesh);
        bullet.mesh.geometry.dispose();
        bullet.mesh.material.dispose();
        return false;
      }
      return true;
    });

    camera.position.x = player.position.x * 0.15;
    camera.lookAt(player.position.x * 0.15, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  return function stopBattle() {
    running = false;
    window.removeEventListener('resize', resize);
    renderer.dispose();
    scene.traverse(object => {
      if (object.isMesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };
}
