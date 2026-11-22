
import { GAME_DATA } from './game-data.js';

const SAVE_KEY = 'arena-rush-save-v1';

export function saveGame() {
  try {
    const saveData = {
      player: GAME_DATA.player,
      brawlers: GAME_DATA.brawlers,
      quests: GAME_DATA.quests
    };

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(saveData)
    );

    return true;
  } catch (error) {
    console.error('저장 실패:', error);
    return false;
  }
}

export function loadGame() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) return false;

    const data = JSON.parse(saved);

    if (!data || typeof data !== 'object') {
      return false;
    }

    if (data.player) {
      Object.assign(GAME_DATA.player, data.player);
    }

    if (Array.isArray(data.brawlers)) {
      data.brawlers.forEach(savedBrawler => {
        const brawler = GAME_DATA.brawlers.find(
          item => item.id === savedBrawler.id
        );

        if (brawler) {
          brawler.unlocked = Boolean(savedBrawler.unlocked);
        }
      });
    }

    if (Array.isArray(data.quests)) {
      data.quests.forEach(savedQuest => {
        const quest = GAME_DATA.quests.find(
          item => item.id === savedQuest.id
        );

        if (quest) {
          quest.completed = Boolean(savedQuest.completed);
        }
      });
    }

    return true;
  } catch (error) {
    console.error('불러오기 실패:', error);
    return false;
  }
}
