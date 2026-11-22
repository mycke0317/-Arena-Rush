
import { GAME_DATA } from './game-data.js';

const MATCH_REWARD = {
  win: {
    coins: 20,
    trophies: 8,
    xp: 30
  },
  lose: {
    coins: 5,
    trophies: 2,
    xp: 10
  }
};

export function giveBattleReward(result) {
  if (result !== 'win' && result !== 'lose') {
    return {
      success: false,
      message: '올바르지 않은 전투 결과입니다.'
    };
  }

  const reward = MATCH_REWARD[result];

  GAME_DATA.player.coins += reward.coins;
  GAME_DATA.player.trophies += reward.trophies;

  GAME_DATA.player.level =
    Math.floor(GAME_DATA.player.trophies / 100) + 1;

  return {
    success: true,
    coins: reward.coins,
    trophies: reward.trophies,
    xp: reward.xp,
    level: GAME_DATA.player.level,
    message: result === 'win'
      ? '승리 보상을 획득했습니다!'
      : '참가 보상을 획득했습니다!'
  };
}
