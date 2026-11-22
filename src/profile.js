
import { GAME_DATA } from './game-data.js';

const PROFILE_KEY = 'arena-rush-profile-v1';

export function getProfile() {
  return {
    name: GAME_DATA.player.name,
    level: GAME_DATA.player.level,
    trophies: GAME_DATA.player.trophies,
    coins: GAME_DATA.player.coins,
    gems: GAME_DATA.player.gems
  };
}

export function changePlayerName(name) {
  const newName = String(name).trim();

  if (newName.length < 2 || newName.length > 12) {
    return {
      success: false,
      message: '이름은 2~12자로 입력하세요.'
    };
  }

  GAME_DATA.player.name = newName;
  saveProfile();

  return {
    success: true,
    message: '닉네임이 변경되었습니다.'
  };
}

export function addTrophies(amount) {
  const value = Math.max(0, Math.floor(Number(amount) || 0));

  GAME_DATA.player.trophies += value;

  GAME_DATA.player.level =
    Math.floor(GAME_DATA.player.trophies / 100) + 1;

  saveProfile();

  return getProfile();
}

export function saveProfile() {
  try {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(getProfile())
    );

    return true;
  } catch (error) {
    console.error('프로필 저장 실패:', error);
    return false;
  }
}

export function loadProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    if (!saved) return false;

    const profile = JSON.parse(saved);

    if (typeof profile.name === 'string') {
      GAME_DATA.player.name = profile.name;
    }

    if (Number.isFinite(profile.level)) {
      GAME_DATA.player.level = profile.level;
    }

    if (Number.isFinite(profile.trophies)) {
      GAME_DATA.player.trophies = profile.trophies;
    }

    return true;
  } catch (error) {
    console.error('프로필 불러오기 실패:', error);
    return false;
  }
}
