/**
 * 유저 상태
 *
 * IN_HUB     게임 페이지 접속
 * IN_QUEUE   큐 접속
 * OFFLINE    오프라인
 * ONLINE     사이트 접속
 * PLAYING    게임 중
 * SPECTATING 관전 중
 */
export enum UserStatus {
  IN_HUB,
  IN_QUEUE,
  OFFLINE,
  ONLINE,
  PLAYING,
  SPECTATING,
}

/**
 * 게임 상태
 *
 * WAITING
 * STARTING
 * PLAYING
 * PAUSED
 * RESUMED
 * PLAYER_ONE_SCORED
 * PLAYER_TWO_SCORED
 * PLAYER_ONE_WIN
 * PLAYER_TWO_WIN
 * END_GAME
 */
export enum GameState {
  WAITING,
  STARTING,
  PLAYING,
  PAUSED,
  RESUMED,
  PLAYER_ONE_SCORED,
  PLAYER_TWO_SCORED,
  PLAYER_ONE_WIN,
  PLAYER_TWO_WIN,
}

/**
 * 게임 모드
 *
 * DEFAULT
 * TIMER
 * LIFE
 */
export enum GameMode {
  DEFAULT,
  BIG,
}
