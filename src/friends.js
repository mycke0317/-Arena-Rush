
const FRIENDS_KEY = 'arena-rush-friends-v1';

function loadFriends() {
  try {
    const saved = localStorage.getItem(FRIENDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFriends(friends) {
  localStorage.setItem(
    FRIENDS_KEY,
    JSON.stringify(friends)
  );
}

export function getFriends() {
  return loadFriends();
}

export function addFriend(name) {
  const friendName = String(name).trim();

  if (friendName.length < 2 || friendName.length > 12) {
    return {
      success: false,
      message: '닉네임은 2~12자로 입력하세요.'
    };
  }

  const friends = loadFriends();

  if (friends.some(friend => friend.name === friendName)) {
    return {
      success: false,
      message: '이미 등록된 친구입니다.'
    };
  }

  friends.push({
    id: crypto.randomUUID(),
    name: friendName,
    status: 'offline'
  });

  saveFriends(friends);

  return {
    success: true,
    message: '친구가 추가되었습니다.'
  };
}

export function removeFriend(id) {
  const friends = loadFriends();
  const updated = friends.filter(friend => friend.id !== id);

  saveFriends(updated);

  return updated.length !== friends.length;
}
