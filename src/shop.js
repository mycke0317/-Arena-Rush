
import { GAME_DATA } from './game-data.js';

export const SHOP_ITEMS = [
  {
    id: 'coin-pack',
    name: '코인 상자',
    description: '코인 100개를 획득합니다.',
    price: 0,
    reward: 100,
    currency: 'free'
  },
  {
    id: 'gem-pack',
    name: '보석 상자',
    description: '보석 5개를 획득합니다.',
    price: 50,
    reward: 5,
    currency: 'coins'
  }
];

export function getShopItems() {
  return SHOP_ITEMS;
}

export function purchaseItem(id) {
  const item = SHOP_ITEMS.find(
    product => product.id === id
  );

  if (!item) {
    return {
      success: false,
      message: '상품을 찾을 수 없습니다.'
    };
  }

  if (item.currency === 'free') {
    return {
      success: false,
      message: '무료 상품 지급 기능은 아직 준비 중입니다.'
    };
  }

  if (GAME_DATA.player.coins < item.price) {
    return {
      success: false,
      message: '코인이 부족합니다.'
    };
  }

  GAME_DATA.player.coins -= item.price;

  if (item.id === 'gem-pack') {
    GAME_DATA.player.gems += item.reward;
  }

  return {
    success: true,
    message: `${item.name} 구매 완료!`
  };
}
