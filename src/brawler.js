
import { GAME_DATA } from './game-data.js';

export function getBrawlers() {
  return GAME_DATA.brawlers;
}

export function getBrawler(id) {
  return GAME_DATA.brawlers.find(
    brawler => brawler.id === id
  ) || null;
}

export function getUnlockedBrawlers() {
  return GAME_DATA.brawlers.filter(
    brawler => brawler.unlocked
  );
}

export function unlockBrawler(id) {
  const brawler = getBrawler(id);

  if (!brawler || brawler.unlocked) {
    return false;
  }

  brawler.unlocked = true;
  return true;
}
