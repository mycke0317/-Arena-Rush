
import { GAME_DATA } from './game-data.js';

const REWARDS = [
  { type: 'coins', amount: 30, name: '코인 30개' },
  { type: 'coins', amount: 50, name: '코인 50개' },
  { type: 'gems', amount: 3, name: '보석 3개' }
];

const STORAGE_KEY = 'arena-rush-stardrop-v1';

export function openStarDrop() {
  const opened = localStorage.getItem(STORAGE_KEY);

  if (opened === new Date().toDateString()) {
    return {
      success: false,
      message: '오늘의 스타 드롭은 이미 받았습니다.'
    };
  }

  const reward = REWARDS[
    Math.floor(Math.random() * REWARDS.length)
  ];

  if (reward.type === 'coins') {
    GAME_DATA.player.coins += reward.amount;
  }

  if (reward.type === 'gems') {
    GAME_DATA.player.gems += reward.amount;
  }

  localStorage.setItem(
    STORAGE_KEY,
    new Date().toDateString()
  );

  return {
    success: true,
    reward: reward.name,
    message: `${reward.name} 획득!`
  };
}
