
import './style.css';
import './battle.css';
import * as THREE from 'three';
import { startBattle } from './battle.js';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="lobby">
    <header class="top-bar">
      <div class="profile">
        <div class="profile-avatar">⚔️</div>
        <div>
          <strong>플레이어</strong>
          <small>레벨 1</small>
        </div>
      </div>

      <div class="currencies">
        <span>🪙 100</span>
        <span>💎 10</span>
      </div>
    </header>

    <nav class="side-menu">
      <button data-menu="친구">👥 친구</button>
      <button data-menu="클럽">🏆 클럽</button>
      <button data-menu="상점">🛒 상점</button>
    </nav>

    <section class="hero-section">
      <div class="hero-title">
        <h1>ARENA RUSH</h1>
        <p>최고의 전투를 시작하라!</p>
      </div>
      <div id="hero-canvas"></div>
    </section>

    <section class="event-panel">
      <div>
        <strong>오늘의 이벤트</strong>
        <p>3대3 아레나 전투</p>
      </div>
      <button id="event-button">이벤트 보기</button>
    </section>

    <section class="bottom-menu">
      <button data-menu="브롤러">⚔️<span>브롤러</span></button>
      <button data-menu="스타 드롭">🎁<span>스타 드롭</span></button>
      <button data-menu="퀘스트">📜<span>퀘스트</span></button>
      <button data-menu="프로필">👤<span>프로필</span></button>
    </section>

    <button class="battle-button" id="battle-button">
      전투 시작
    </button>
  </main>

  <div id="menu-modal" class="modal hidden">
    <div class="modal-box">
      <button id="close-modal">✕</button>
      <h2 id="modal-title"></h2>
      <p id="modal-description"></p>
    </div>
  </div>
`;

const menuDescriptions = {
  친구: '친구 목록과 함께 플레이할 친구를 확인하세요.',
  클럽: '클럽에 가입하고 다른 플레이어와 함께하세요.',
  상점: '새로운 아이템과 보상을 확인하세요.',
  브롤러: '전투에 사용할 캐릭터를 선택하세요.',
  '스타 드롭': '무료 보상을 확인하세요.',
  퀘스트: '퀘스트를 완료하고 보상을 받으세요.',
  프로필: '플레이어 정보와 전적을 확인하세요.'
};

const modal = document.querySelector('#menu-modal');
const modalTitle = document.querySelector('#modal-title');
const modalDescription = document.querySelector('#modal-description');

document.querySelectorAll('[data-menu]').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.menu;
    modalTitle.textContent = name;
    modalDescription.textContent =
      menuDescriptions[name] || '준비 중인 메뉴입니다.';
    modal.classList.remove('hidden');
  });
});

document.querySelector('#event-button').addEventListener('click', () => {
  modalTitle.textContent = '오늘의 이벤트';
  modalDescription.textContent = '3대3 아레나 전투를 준비하세요!';
  modal.classList.remove('hidden');
});

document.querySelector('#close-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

// 3D 로비 캐릭터
const canvasContainer = document.querySelector('#hero-canvas');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202044);

const camera = new THREE.PerspectiveCamera(
  45,
  1,
  0.1,
  100
);
camera.position.set(0, 2.5, 7);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x555577, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

// 캐릭터 몸통
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.65, 0.8, 6, 12),
  new THREE.MeshStandardMaterial({ color: 0x398cff })
);
body.position.y = 1.1;
scene.add(body);

// 캐릭터 머리
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0xffc28a })
);
head.position.y = 2;
scene.add(head);

// 눈
const eyeMaterial = new THREE.MeshBasicMaterial({
  color: 0x171717
});

for (const x of [-0.16, 0.16]) {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    eyeMaterial
  );
  eye.position.set(x, 2.05, 0.43);
  scene.add(eye);
}

// 바닥
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3, 48),
  new THREE.MeshStandardMaterial({ color: 0x34345c })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

function resizeRenderer() {
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', resizeRenderer);
resizeRenderer();

let lobbyRunning = true;

function animate() {
  if (!lobbyRunning) return;

  requestAnimationFrame(animate);

  body.rotation.y += 0.005;
  head.rotation.y = Math.sin(Date.now() * 0.001) * 0.08;

  renderer.render(scene, camera);
}

animate();

// 전투 시작
document.querySelector('#battle-button').addEventListener('click', () => {
  const battleContainer = document.createElement('div');
  battleContainer.id = 'battle-container';
  document.body.appendChild(battleContainer);

  lobbyRunning = false;

  const cleanup = startBattle(battleContainer);

  const exitButton = battleContainer.querySelector('.battle-exit');

  if (exitButton) {
    exitButton.addEventListener('click', () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }

      battleContainer.remove();
      lobbyRunning = true;
      animate();
    });
  }
});
