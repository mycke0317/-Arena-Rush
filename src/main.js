
import './style.css';
import * as THREE from 'three';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="game">

    <header class="topbar">
      <div class="profile">
        <div class="avatar">⚔️</div>
        <div>
          <strong>PLAYER</strong>
          <small>트로피 🏆 0</small>
        </div>
      </div>

      <div class="currencies">
        <span>🪙 100</span>
        <span>💎 20</span>
      </div>
    </header>

    <aside class="left-menu">
      <button data-page="친구">👥<small>친구</small></button>
      <button data-page="클럽">🛡️<small>클럽</small></button>
      <button data-page="우편함">✉️<small>우편함</small></button>
    </aside>

    <aside class="right-menu">
      <button data-page="상점">🛒<small>상점</small></button>
      <button data-page="브롤러">🦸<small>브롤러</small></button>
      <button data-page="스타 드롭">🌟<small>스타 드롭</small></button>
    </aside>

    <main class="hero">
      <div class="season">SEASON 01 · ARENA RUSH</div>
      <div id="character"></div>
      <h1>ARENA RUSH</h1>
      <p>최강의 전사가 되어라!</p>
      <div class="character-name">⚔️ 기본 전사</div>
    </main>

    <section class="bottom-menu">
      <button data-page="퀘스트">📜<small>퀘스트</small></button>
      <button data-page="이벤트">🎯<small>이벤트</small></button>
      <button data-page="브롤러">🦸<small>캐릭터</small></button>
    </section>

    <button class="battle-button" id="battle">
      전투 시작!
    </button>

    <div class="page-overlay" id="overlay">
      <div class="page-box">
        <button class="close" id="close">✕</button>
        <h2 id="page-title">메뉴</h2>
        <div id="page-content"></div>
      </div>
    </div>

  </div>
`;

const pages = {
  '친구': '친구 목록과 친구 초대 기능',
  '클럽': '클럽 만들기와 클럽 가입',
  '우편함': '새로운 소식과 보상',
  '상점': '코인과 캐릭터 상품',
  '브롤러': '캐릭터 선택과 성장',
  '스타 드롭': '스타 드롭 보상',
  '퀘스트': '일일 퀘스트와 보상',
  '이벤트': '새로운 전투 이벤트'
};

const overlay = document.querySelector('#overlay');

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => {
    const page = button.dataset.page;
    document.querySelector('#page-title').textContent = page;
    document.querySelector('#page-content').textContent = pages[page];
    overlay.classList.add('active');
  });
});

document.querySelector('#close').addEventListener('click', () => {
  overlay.classList.remove('active');
});

document.querySelector('#battle').addEventListener('click', () => {
  document.querySelector('#page-title').textContent = '전투 준비';
  document.querySelector('#page-content').textContent =
    '3대3 아레나 전투를 준비하고 있습니다.';
  overlay.classList.add('active');
});

// 3D 캐릭터 장면
const characterArea = document.querySelector('#character');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222044);

const camera = new THREE.PerspectiveCamera(
  35,
  1,
  0.1,
  100
);
camera.position.set(0, 2.5, 7);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
characterArea.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

const warrior = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.65, 0.7, 5, 12),
  new THREE.MeshStandardMaterial({ color: 0x2788ff })
);
body.position.y = 1;
warrior.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0xffcf9e })
);
head.position.y = 2;
warrior.add(head);

const helmet = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({ color: 0xffc42d })
);
helmet.position.y = 2.25;
warrior.add(helmet);

scene.add(warrior);

function resize() {
  const width = characterArea.clientWidth;
  const height = characterArea.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  warrior.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;
  warrior.position.y = Math.sin(Date.now() * 0.002) * 0.08;
  renderer.render(scene, camera);
}

animate();
