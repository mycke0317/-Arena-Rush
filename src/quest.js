
import { GAME_DATA } from './game-data.js';

export function getQuests() {
  return GAME_DATA.quests;
}

export function completeQuest(id) {
  const quest = GAME_DATA.quests.find(
    item => item.id === id
  );

  if (!quest || quest.completed) {
    return 0;
  }

  quest.completed = true;
  GAME_DATA.player.coins += quest.reward;

  return quest.reward;
}

export function getQuestProgress() {
  const total = GAME_DATA.quests.length;

  const completed = GAME_DATA.quests.filter(
    quest => quest.completed
  ).length;

  return {
    completed,
    total,
    percentage: total === 0
      ? 0
      : Math.round((completed / total) * 100)
  };
}
