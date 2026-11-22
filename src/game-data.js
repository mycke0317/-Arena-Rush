
export const GAME_DATA = {
  player: {
    name: '플레이어',
    level: 1,
    trophies: 0,
    coins: 100,
    gems: 10
  },

  modes: [
    {
      id: '3v3',
      name: '3대3 아레나',
      description: '팀원들과 함께 승리를 차지하세요.'
    },
    {
      id: 'solo',
      name: '솔로 아레나',
      description: '혼자서 실력을 시험하세요.'
    }
  ],

  brawlers: [
    {
      id: 'rookie',
      name: '루키',
      role: '밸런스',
      health: 100,
      speed: 5,
      unlocked: true
    },
    {
      id: 'blaze',
      name: '블레이즈',
      role: '공격형',
      health: 85,
      speed: 6,
      unlocked: false
    },
    {
      id: 'guardian',
      name: '가디언',
      role: '방어형',
      health: 140,
      speed: 4,
      unlocked: false
    }
  ],

  quests: [
    {
      id: 1,
      title: '첫 전투 참여하기',
      reward: 20,
      completed: false
    },
    {
      id: 2,
      title: '전투 3회 플레이하기',
      reward: 50,
      completed: false
    }
  ]
};
