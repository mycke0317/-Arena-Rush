
const CLUB_KEY = 'arena-rush-club-v1';

function loadClub() {
  try {
    const saved = localStorage.getItem(CLUB_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveClub(club) {
  localStorage.setItem(CLUB_KEY, JSON.stringify(club));
}

export function getClub() {
  return loadClub();
}

export function createClub(name) {
  const clubName = String(name).trim();

  if (clubName.length < 2 || clubName.length > 15) {
    return {
      success: false,
      message: '클럽 이름은 2~15자로 입력하세요.'
    };
  }

  if (loadClub()) {
    return {
      success: false,
      message: '이미 가입한 클럽이 있습니다.'
    };
  }

  const club = {
    id: crypto.randomUUID(),
    name: clubName,
    members: 1,
    trophies: 0,
    createdAt: Date.now()
  };

  saveClub(club);

  return {
    success: true,
    message: '클럽이 생성되었습니다.',
    club
  };
}

export function leaveClub() {
  if (!loadClub()) {
    return false;
  }

  localStorage.removeItem(CLUB_KEY);
  return true;
}
