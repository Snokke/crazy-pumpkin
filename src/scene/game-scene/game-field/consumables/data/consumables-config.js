const CONSUMABLE_TYPE = {
  SmallCandy: 'SMALL_CANDY',
  BigCandy: 'BIG_CANDY',
  BoosterCandyPlayerSpeed: 'BOOSTER_CANDY_PLAYER_SPEED',
  BoosterCandyPlayerInvulnerability: 'BOOSTER_CANDY_PLAYER_INVULNERABILITY',
  BoosterCandyEnemiesSlow: 'BOOSTER_CANDY_ENEMIES_SLOW',
}

const CONSUMABLES_CONFIG = {
  [CONSUMABLE_TYPE.SmallCandy]: {
    spawnTime: { min: 3000, max: 6000 },
    lifeTime: { min: 10000, max: 15000 },
    chanceToSpawn: 0.9,
  },
  [CONSUMABLE_TYPE.BigCandy]: {
    spawnTime: { min: 7000, max: 10000 },
    lifeTime: { min: 10000, max: 15000 },
    chanceToSpawn: 0.5,
  },
  [CONSUMABLE_TYPE.BoosterCandyPlayerSpeed]: {
    lifeTime: { min: 20000, max: 25000 },
    name: 'Speed Bonus',
    color: 0x00aa00,
    progressBarWidth: 200,
    duration: 18000,
    speedMultiplier: 1.8,
  },
  [CONSUMABLE_TYPE.BoosterCandyPlayerInvulnerability]: {
    lifeTime: { min: 20000, max: 25000 },
    name: 'Invulnerability',
    color: 0xcccc00,
    progressBarWidth: 250,
    duration: 12000,
  },
  [CONSUMABLE_TYPE.BoosterCandyEnemiesSlow]: {
    lifeTime: { min: 20000, max: 25000 },
    name: 'Enemies Slow',
    color: 0x0000bb,
    progressBarWidth: 210,
    duration: 18000,
    speedMultiplier: 0.4,
  },
  boosterCandyConfig: {
    spawnTime: { min: 10000, max: 15000 },
    chanceToSpawn: 0.5,
  },
}

export {
  CONSUMABLE_TYPE,
  CONSUMABLES_CONFIG,
};
