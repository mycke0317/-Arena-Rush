
import './style.css';
import './battle.css';
import * as THREE from 'three';

import { startBattle } from './battle.js';
import { GAME_DATA } from './game-data.js';
import { getFriends, addFriend, removeFriend } from './friends.js';
import { getClub, createClub, leaveClub } from './club.js';
import { getQuests, completeQuest } from './quest.js';
import { getShopItems, purchaseItem } from './shop.js';
import { openStarDrop } from './stardrop.js';
import { getProfile, changePlayerName } from './profile.js';
import { saveGame, loadGame } from './storage.js';

loadGame();

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="lobby">
    <header class="top-bar">
      <div class="profile">
        <div class="profile-avatar">⚔️</div>
        <div>
          <strong id="player-name"></strong>
          <small id="player-level"></small>
        </div>
      </div>
      <div class="currencies">
        <span id="player-coins"></span>
        <span id="player-gems"></span>
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
      <div id="modal-content"></div>
    </div>
  </div>
`;

const modal = document.querySelector('#menu-modal');
const modalTitle = document.querySelector('#modal-title');
const modalContent = document.querySelector('#modal-content');

function refreshProfile() {
  const profile = getProfile();

  document.querySelector('#player-name').textContent = profile.name;
  document.querySelector('#player-level').textContent = `레벨 ${profile.level}`;
  document.querySelector('#player-coins').textContent = `🪙 ${GAME_DATA.player.coins}`;
  document.querySelector('#player-gems').textContent = `💎 ${GAME_DATA.player.gems}`;
}

function saveAndRefresh() {
  saveGame();
  refreshProfile();
}

function makeButton(label, callback) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.addEventListener('click', callback);
  return element;
}

function openMenu(title, content) {
  modalTitle.textContent = title;
  modalContent.replaceChildren();

  if (typeof content === 'string') {
    modalContent.textContent = content;
  } else {
    modalContent.appendChild(content);
  }

  modal.classList.remove('hidden');
}

function showFriends() {
  const panel = document.createElement('div');
  const input = document.createElement('input');
  input.placeholder = '친구 닉네임';

  panel.append(
    input,
    makeButton('친구 추가', () => {
      const result = addFriend(input.value);
      alert(result.message);
      if (result.success) showFriends();
    })
  );

  getFriends().forEach(friend => {
    const line = document.createElement('p');
    line.textContent = `${friend.name} · ${friend.status} `;

    line.appendChild(makeButton('삭제', () => {
      removeFriend(friend.id);
      showFriends();
    }));

    panel.appendChild(line);
  });

  openMenu('친구', panel);
}

function showClub() {
  const panel = document.createElement('div');
  const club = getClub();

  if (club) {
    const info = document.createElement('p');
    info.textContent = `${club.name} · 멤버 ${club.members}명`;

    panel.append(
      info,
      makeButton('클럽 나가기', () => {
        leaveClub();
        showClub();
      })
    );
  } else {
    const input = document.createElement('input');
    input.placeholder = '새 클럽 이름';

    panel.append(
      input,
      makeButton('클럽 만들기', () => {
        const result = createClub(input.value);
        alert(result.message);
        if (result.success) showClub();
      })
    );
  }

  openMenu('클럽', panel);
}

function showShop() {
  const panel = document.createElement('div');

  getShopItems().forEach(item => {
    const line = document.createElement('p');
    line.textContent = `${item.name} - ${item.description} `;

    line.appendChild(makeButton(
      item.price === 0 ? '무료 받기' : `${item.price} 코인 구매`,
      () => {
        const result = purchaseItem(item.id);
        alert(result.message);
        saveAndRefresh();
      }
    ));

    panel.appendChild(line);
  });

  openMenu('상점', panel);
}

function showBrawlers() {
  const panel = document.createElement('div');

  GAME_DATA.brawlers.forEach(brawler => {
    const line = document.createElement('p');
    line.textContent =
      `${brawler.name} · ${brawler.role} · 체력 ${brawler.health} · ` +
      (brawler.unlocked ? '보유 중' : '잠김');

    panel.appendChild(line);
  });

  openMenu('브롤러', panel);
}

function showQuests() {
  const panel = document.createElement('div');

  getQuests().forEach(quest => {
    const line = document.createElement('p');
    line.textContent =
      `${quest.title} · 보상 ${quest.reward} 코인 `;

    if (quest.completed) {
      line.append('완료');
    } else {
      line.appendChild(makeButton('완료 처리', () => {
        const reward = completeQuest(quest.id);
        alert(`${reward} 코인을 획득했습니다!`);
        saveAndRefresh();
        showQuests();
      }));
    }

    panel.appendChild(line);
  });

  openMenu('퀘스트', panel);
}

function showStarDrop() {
  const panel = document.createElement('div');

  panel.appendChild(makeButton('스타 드롭 열기 🎁', () => {
    const result = openStarDrop();
    alert(result.message);
    saveAndRefresh();
  }));

  openMenu('스타 드롭', panel);
}

function showProfile() {
  const panel = document.createElement('div');
  const profile = getProfile();

  const info = document.createElement('p');
  info.textContent =
    `${profile.name} · 레벨 ${profile.level} · 트로피 ${profile.trophies}`;

  const input = document.createElement('input');
  input.placeholder = '새 닉네임';

  panel.append(
    info,
    input,
    makeButton('닉네임 변경', () => {
      const result = changePlayerName(input.value);
      alert(result.message);
      saveAndRefresh();
      showProfile();
    })
  );

  openMenu('프로필', panel);
}

const menuActions = {
  친구: showFriends,
  클럽: showClub,
  상점: showShop,
  브롤러: showBrawlers,
  '스타 드롭': showStarDrop,
  퀘스트: showQuests,
  프로필: showProfile
};

document.querySelectorAll('[data-menu]').forEach(element => {
  element.addEventListener('click', () => {
    menuActions[element.dataset.menu]?.();
  });
});

document.querySelector('#event-button').addEventListener('click', () => {
  openMenu('오늘의 이벤트', '3대3 아레나 전투를 준비하세요!');
});

document.querySelector('#close-modal').addEventListener('click', () => {
  modal.classList.add('hidden');
});

modal.addEventListener('click', event => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

refreshProfile();

// 3D 로비 캐릭터
const canvasContainer = document.querySelector('#hero-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202044);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 2.5, 7);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x555577, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 5, 4);
scene.add(light);

const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.65, 0.8, 6, 12),
  new THREE.MeshStandardMaterial({ color: 0x398cff })
);
body.position.y = 1.1;
scene.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.48, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0xffc28a })
);
head.position.y = 2;
scene.add(head);

const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x171717 });

for (const x of [-0.16, 0.16]) {
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 12, 12),
    eyeMaterial
  );
  eye.position.set(x, 2.05, 0.43);
  scene.add(eye);
}

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3, 48),
  new THREE.MeshStandardMaterial({ color: 0x34345c })
);
floor.rotation.x = -Math.PI / 2;
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
      if (typeof cleanup === 'function') cleanup();

      battleContainer.remove();
      lobbyRunning = true;
      animate();
      saveAndRefresh();
    });
  }
});
