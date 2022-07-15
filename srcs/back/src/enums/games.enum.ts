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

export enum GameMode {
  DEFAULT,
  TIMER,
  LIFE,
}

export enum UserStatus {
  IN_HUB,
  IN_QUEUE,
  OFFLINE,
  ONLINE,
  PLAYING,
  SPECTATING,
}
