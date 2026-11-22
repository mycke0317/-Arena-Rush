  import * as THREE from 'three';
import { giveBattleReward } from './rewards.js';
import { saveGame } from './storage.js';

export function startBattle(container) {
  let running = true;
  let finished = false;
  let animationId = null;

  const screen = document.createElement('section');
  screen.className = 'battle-screen';

  screen.innerHTML = `
    <div class="battle-world"></div>
    <div class="battle-score">아군 0 : 0 적군</div>

    <div class="battle-joystick">
      <div class="battle-stick"></div>
    </div>

    <button class="battle-attack" type="button">공격</button>
    <button class="battle-super" type="button">특수 공격</button>
    <button class="battle-exit" type="button">나가기</button>

    <div class="battle-status">
      <div class="battle-health">체력: 100</div>
      <div class="battle-message">전투 시작!</div>
    </div>
  `;

  container.appendChild(screen);

  const world = screen.querySelector('.battle-world');
  const scoreText = screen.querySelector('.battle-score');
  const healthText = screen.querySelector('.battle-health');
  const messageText = screen.querySelector('.battle-message');
  const joystick = screen.querySelector('.battle-joystick');
  const stick = screen.querySelector('.battle-stick');
  const attackButton = screen.querySelector('.battle-attack');
  const superButton = screen.querySelector('.battle-super');
  const exitButton = screen.querySelector('.battle-exit');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x17243a);

  const camera = new THREE.OrthographicCamera(
    -12, 12, 12, -12, 0.1, 100
  );
  camera.position.set(0, 28, 0.01);
  camera.up.set(0, 0, -1);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  world.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x526078, 2));

  const sunlight = new THREE.DirectionalLight(0xffffff, 2);
  sunlight.position.set(5, 15, 8);
  sunlight.castShadow = true;
  scene.add(sunlight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.MeshStandardMaterial({ color: 0x365b4b })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.15;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(24, 24, 0x668c72, 0x496d59);
  grid.position.y = -0.1;
  scene.add(grid);

  function makeCharacter(color, x, z, radius = 0.65) {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.75, radius, 0.8, 16),
      new THREE.MeshStandardMaterial({ color })
    );
    body.position.y = 0.55;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.55, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd5a5 })
    );
    head.position.y = 1.15;
    head.castShadow = true;
    group.add(head);

    group.position.set(x, 0, z);
    scene.add(group);

    return group;
  }

  function makeObstacle(x, z, width, depth, color = 0x8c795b) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 1.5, depth),
      new THREE.MeshStandardMaterial({ color })
    );
    mesh.position.set(x, 0.75, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  makeObstacle(-4, -2, 2, 1.4);
  makeObstacle(4, -2, 2, 1.4);
  makeObstacle(-4, 3, 1.5, 2);
  makeObstacle(4, 3, 1.5, 2);
  makeObstacle(0, 0, 2.2, 1.2, 0x657d8b);

  const player = {
    mesh: makeCharacter(0x35a9ff, 0, 7),
    health: 100,
    maxHealth: 100,
    speed: 6,
    cooldown: 0,
    superCharge: 0
  };

  const allies = [
    makeCharacter(0x2388dc, -2, 8, 0.55),
    makeCharacter(0x2388dc, 2, 8, 0.55)
  ];

  const enemies = [
    createEnemy(-4, -7),
    createEnemy(0, -8),
    createEnemy(4, -7)
  ];

  function createEnemy(x, z) {
    return {
      mesh: makeCharacter(0xe64b4b, x, z),
      health: 65,
      maxHealth: 65,
      speed: 2.1,
      cooldown: 1 + Math.random(),
      alive: true
    };
  }

  const bullets = [];
  const obstacles = [
    { x: -4, z: -2, w: 2, d: 1.4 },
    { x: 4, z: -2, w: 2, d: 1.4 },
    { x: -4, z: 3, w: 1.5, d: 2 },
    { x: 4, z: 3, w: 1.5, d: 2 },
    { x: 0, z: 0, w: 2.2, d: 1.2 }
  ];

  const input = { x: 0, z: 0 };
  let joystickPointer = null;
  let superReady = false;

  function resize() {
    const width = Math.max(world.clientWidth, 1);
    const height = Math.max(world.clientHeight, 1);
    const aspect = width / height;
    const viewHeight = 19;

    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  resize();
  window.addEventListener('resize', resize);

  function makeBullet(x, z, dx, dz, owner, damage, speed, color) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 10, 8),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 })
    );

    mesh.position.set(x, 0.65, z);
    scene.add(mesh);

    bullets.push({
      mesh,
      dx,
      dz,
      owner,
      damage,
      speed,
      life: 2
    });
  }

  function nearestEnemy() {
    let target = null;
    let bestDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const dx = enemy.mesh.position.x - player.mesh.position.x;
      const dz = enemy.mesh.position.z - player.mesh.position.z;
      const distance = Math.hypot(dx, dz);

      if (distance < bestDistance) {
        bestDistance = distance;
        target = enemy;
      }
    }

    return target;
  }

  function firePlayerAttack(isSuper = false) {
    if (!running || finished) return;

    const target = nearestEnemy();
    let dx = 0;
    let dz = -1;

    if (target) {
      dx = target.mesh.position.x - player.mesh.position.x;
      dz = target.mesh.position.z - player.mesh.position.z;
      const length = Math.hypot(dx, dz) || 1;
      dx /= length;
      dz /= length;
    }

    const count = isSuper ? 5 : 1;

    for (let i = 0; i < count; i++) {
      const angle = (i - (count - 1) / 2) * (isSuper ? 0.16 : 0);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const shotX = dx * cos - dz * sin;
      const shotZ = dx * sin + dz * cos;

      makeBullet(
        player.mesh.position.x,
        player.mesh.position.z,
        shotX,
        shotZ,
        'player',
        isSuper ? 28 : 18,
        isSuper ? 13 : 11,
        isSuper ? 0xffd447 : 0x8be5ff
      );
    }

    if (isSuper) {
      player.superCharge = 0;
      superReady = false;
      superButton.textContent = '특수 공격';
      superButton.disabled = true;
    }
  }

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDistance = rect.width * 0.32;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.hypot(dx, dy);
    if (distance > maxDistance) {
      dx = dx / distance * maxDistance;
      dy = dy / distance * maxDistance;
    }

    input.x = dx / maxDistance;
    input.z = dy / maxDistance;

    stick.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function resetJoystick() {
    input.x = 0;
    input.z = 0;
    joystickPointer = null;
    stick.style.transform = 'translate(0px, 0px)';
  }

  joystick.addEventListener('pointerdown', event => {
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  });

  joystick.addEventListener('pointermove', event => {
    if (event.pointerId === joystickPointer) {
      updateJoystick(event);
    }
  });

  joystick.addEventListener('pointerup', resetJoystick);
  joystick.addEventListener('pointercancel', resetJoystick);

  attackButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (player.cooldown <= 0) {
      firePlayerAttack(false);
      player.cooldown = 0.38;
    }
  });

  superButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (superReady) firePlayerAttack(true);
  });

  function updatePlayer(delta) {
    if (finished) return;

    const length = Math.hypot(input.x, input.z);
    if (length > 0.05) {
      const moveX = input.x / Math.max(length, 1) * player.speed * delta;
      const moveZ = input.z / Math.max(length, 1) * player.speed * delta;

      player.mesh.position.x += moveX;
      player.mesh.position.z += moveZ;
      player.mesh.rotation.y = Math.atan2(moveX, moveZ);
    }

    player.mesh.position.x = THREE.MathUtils.clamp(player.mesh.position.x, -10, 10);
    player.mesh.position.z = THREE.MathUtils.clamp(player.mesh.position.z, -10, 10);

    player.cooldown = Math.max(0, player.cooldown - delta);

    if (player.superCharge >= 100 && !superReady) {
      superReady = true;
      superButton.disabled = false;
      superButton.textContent = '특수 공격 준비!';
    }
  }

  function updateEnemies(delta) {
    if (finished) return;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const dx = player.mesh.position.x - enemy.mesh.position.x;
      const dz = player.mesh.position.z - enemy.mesh.position.z;
      const distance = Math.hypot(dx, dz) || 1;

      if (distance > 4) {
        enemy.mesh.position.x += dx / distance * enemy.speed * delta;
        enemy.mesh.position.z += dz / distance * enemy.speed * delta;
      }

      enemy.mesh.rotation.y = Math.atan2(dx, dz);
      enemy.cooldown -= delta;

      if (enemy.cooldown <= 0 && distance < 10) {
        makeBullet(
          enemy.mesh.position.x,
          enemy.mesh.position.z,
          dx / distance,
          dz / distance,
          'enemy',
          8,
          7,
          0xff7777
        );
        enemy.cooldown = 1.5 + Math.random();
      }
    }
  }

  function hitsObstacle(x, z) {
    return obstacles.some(obstacle =>
      Math.abs(x - obstacle.x) < obstacle.w / 2 + 0.25 &&
      Math.abs(z - obstacle.z) < obstacle.d / 2 + 0.25
    );
  }

  function updateBullets(delta) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      bullet.mesh.position.x += bullet.dx * bullet.speed * delta;
      bullet.mesh.position.z += bullet.dz * bullet.speed * delta;
      bullet.life -= delta;

      const x = bullet.mesh.position.x;
      const z = bullet.mesh.position.z;

      if (bullet.life <= 0 || Math.abs(x) > 12 || Math.abs(z) > 12 || hitsObstacle(x, z)) {
        scene.remove(bullet.mesh);
        bullet.mesh.geometry.dispose();
        bullet.mesh.material.dispose();
        bullets.splice(i, 1);
        continue;
      }

      if (bullet.owner === 'player') {
        let hit = false;

        for (const enemy of enemies) {
          if (!enemy.alive) continue;

          const distance = Math.hypot(
            enemy.mesh.position.x - x,
            enemy.mesh.position.z - z
          );

          if (distance < 0.85) {
            enemy.health -= bullet.damage;
            player.superCharge = Math.min(100, player.superCharge + 18);
            hit = true;

            if (enemy.health <= 0) {
              enemy.alive = false;
              scene.remove(enemy.mesh);
            }
            break;
          }
        }

        if (hit) {
          scene.remove(bullet.mesh);
          bullet.mesh.geometry.dispose();
          bullet.mesh.material.dispose();
          bullets.splice(i, 1);
        }
      } else {
        const distance = Math.hypot(
          player.mesh.position.x - x,
          player.mesh.position.z - z
        );

        if (distance < 0.85) {
          player.health -= bullet.damage;
          scene.remove(bullet.mesh);
          bullet.mesh.geometry.dispose();
          bullet.mesh.material.dispose();
          bullets.splice(i, 1);
        }
      }
    }
  }

  function updateHud() {
    const defeated = enemies.filter(enemy => !enemy.alive).length;
    scoreText.textContent = `아군 ${defeated} : ${3 - defeated} 적군`;
    healthText.textContent = `체력: ${Math.max(0, Math.ceil(player.health))}`;
  }

  function finishBattle(result) {
    if (finished) return;
    finished = true;
    input.x = 0;
    input.z = 0;

    let rewardMessage = '';

    try {
      const reward = giveBattleReward(result);
      saveGame();

      if (reward && typeof reward === 'object') {
        rewardMessage = ` 보상: 코인 ${reward.coins ?? 0}개`;
      }
    } catch (error) {
      console.error('보상 저장 오류:', error);
    }

    messageText.textContent =
      result === 'win'
        ? `승리!${rewardMessage}`
        : '패배! 다음 전투에 도전하세요.';

    messageText.style.display = 'block';
    attackButton.disabled = true;
    superButton.disabled = true;
  }

  const clock = new THREE.Clock();

  function animate() {
    if (!running) return;

    animationId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);

    updatePlayer(delta);
    updateEnemies(delta);
    updateBullets(delta);
    updateHud();

    if (!finished && enemies.every(enemy => !enemy.alive)) {
      finishBattle('win');
    } else if (!finished && player.health <= 0) {
      player.health = 0;
      finishBattle('lose');
    }

    renderer.render(scene, camera);
  }

  messageText.style.display = 'none';
  superButton.disabled = true;
  animate();

  function cleanup() {
    if (!running) return;
    running = false;

    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }

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

    screen.remove();
  }

  exitButton.addEventListener('click', cleanup);

  return cleanup;
    }
