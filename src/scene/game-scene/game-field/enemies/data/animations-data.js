const ANIMATION_TYPE = {
  Cheer: 'CHEER',
  Dance: 'DANCE',
  DashBack: 'DASH_BACK',
  DashFront: 'DASH_FRONT',
  DashLeft: 'DASH_LEFT',
  DashRight: 'DASH_RIGHT',
  Hop: 'HOP',
  Idle: 'IDLE',
  Jump: 'JUMP',
  Run: 'RUN',
  ShootBow: 'SHOOT_BOW',
  Walk: 'WALK',
}

const ANIMATION_BY_REAL_NAME = {
  'KayKit Animated Character|KayKit Animated Character|Cheer': ANIMATION_TYPE.Cheer,
  'KayKit Animated Character|KayKit Animated Character|Dance': ANIMATION_TYPE.Dance,
  'KayKit Animated Character|KayKit Animated Character|DashBack': ANIMATION_TYPE.DashBack,
  'KayKit Animated Character|KayKit Animated Character|DashFront': ANIMATION_TYPE.DashFront,
  'KayKit Animated Character|KayKit Animated Character|DashLeft': ANIMATION_TYPE.DashLeft,
  'KayKit Animated Character|KayKit Animated Character|DashRight': ANIMATION_TYPE.DashRight,
  'KayKit Animated Character|KayKit Animated Character|Hop': ANIMATION_TYPE.Hop,
  'KayKit Animated Character|KayKit Animated Character|Idle': ANIMATION_TYPE.Idle,
  'KayKit Animated Character|KayKit Animated Character|Jump': ANIMATION_TYPE.Jump,
  'KayKit Animated Character|KayKit Animated Character|Run': ANIMATION_TYPE.Run,
  'KayKit Animated Character|KayKit Animated Character|Shoot(2h)Bo': ANIMATION_TYPE.ShootBow,
  'KayKit Animated Character|KayKit Animated Character|Walk': ANIMATION_TYPE.Walk,
}

// ------------------------------------------------------------

// const ANIMATION_TYPE = {
//   Attack: 'ATTACK', // remove
//   AttackCombo: 'ATTACK_COMBO', // remove
//   AttackSpin: 'ATTACK_SPIN', // remove
//   BasePose: 'BASE_POSE', // remove
//   Block: 'BLOCK', // remove
//   Cheer: 'CHEER',
//   Climbing: 'CLIMBING', // remove
//   Dance: 'DANCE',
//   DashBack: 'DASH_BACK',
//   DashFront: 'DASH_FRONT',
//   DashLeft: 'DASH_LEFT',
//   DashRight: 'DASH_RIGHT',
//   Defeat: 'DEFEAT', // remove
//   HeavyAttack: 'HEAVY_ATTACK', // remove
//   Hop: 'HOP',
//   Idle: 'IDLE',
//   Interact: 'INTERACT', // remove
//   Jump: 'JUMP',
//   LayingDown: 'LAYING_DOWN', // remove
//   PickUp: 'PICK_UP', // remove
//   Roll: 'ROLL', // remove
//   Run: 'RUN',
//   Shoot_01: 'SHOOT_01', // remove
//   Shoot_02: 'SHOOT_02', // remove
//   ShootBow: 'SHOOT_BOW',
//   Shooting_01: 'SHOOTING_01', // remove
//   Shooting_02: 'SHOOTING_02', // remove
//   Throw: 'THROW', // remove
//   Walk: 'WALK',
//   Wave: 'WAVE', // remove
// }

// const ANIMATION_BY_REAL_NAME = {
//   'KayKit Animated Character|KayKit Animated Character|Attack(1h)': ANIMATION_TYPE.Attack, // remove
//   'KayKit Animated Character|KayKit Animated Character|AttackCombo': ANIMATION_TYPE.AttackCombo, // remove
//   'KayKit Animated Character|KayKit Animated Character|AttackSpinn': ANIMATION_TYPE.AttackSpin, // remove
//   'KayKit Animated Character|KayKit Animated Character|BasePose': ANIMATION_TYPE.BasePose, // remove
//   'KayKit Animated Character|KayKit Animated Character|Block': ANIMATION_TYPE.Block, // remove
//   'KayKit Animated Character|KayKit Animated Character|Cheer': ANIMATION_TYPE.Cheer,
//   'KayKit Animated Character|KayKit Animated Character|Climbing': ANIMATION_TYPE.Climbing, // remove
//   'KayKit Animated Character|KayKit Animated Character|Dance': ANIMATION_TYPE.Dance,
//   'KayKit Animated Character|KayKit Animated Character|DashBack': ANIMATION_TYPE.DashBack,
//   'KayKit Animated Character|KayKit Animated Character|DashFront': ANIMATION_TYPE.DashFront,
//   'KayKit Animated Character|KayKit Animated Character|DashLeft': ANIMATION_TYPE.DashLeft,
//   'KayKit Animated Character|KayKit Animated Character|DashRight': ANIMATION_TYPE.DashRight,
//   'KayKit Animated Character|KayKit Animated Character|Defeat': ANIMATION_TYPE.Defeat, // remove
//   'KayKit Animated Character|KayKit Animated Character|HeavyAttack': ANIMATION_TYPE.HeavyAttack, // remove
//   'KayKit Animated Character|KayKit Animated Character|Hop': ANIMATION_TYPE.Hop,
//   'KayKit Animated Character|KayKit Animated Character|Idle': ANIMATION_TYPE.Idle,
//   'KayKit Animated Character|KayKit Animated Character|Interact': ANIMATION_TYPE.Interact, // remove
//   'KayKit Animated Character|KayKit Animated Character|Jump': ANIMATION_TYPE.Jump,
//   'KayKit Animated Character|KayKit Animated Character|LayingDownI': ANIMATION_TYPE.LayingDown, // remove
//   'KayKit Animated Character|KayKit Animated Character|PickUp': ANIMATION_TYPE.PickUp, // remove
//   'KayKit Animated Character|KayKit Animated Character|Roll': ANIMATION_TYPE.Roll, // remove
//   'KayKit Animated Character|KayKit Animated Character|Run': ANIMATION_TYPE.Run,
//   'KayKit Animated Character|KayKit Animated Character|Shoot(1h)': ANIMATION_TYPE.Shoot_01, // remove
//   'KayKit Animated Character|KayKit Animated Character|Shoot(2h)': ANIMATION_TYPE.Shoot_02, // remove
//   'KayKit Animated Character|KayKit Animated Character|Shoot(2h)Bo': ANIMATION_TYPE.ShootBow,
//   'KayKit Animated Character|KayKit Animated Character|Shooting(1h': ANIMATION_TYPE.Shooting_01, // remove
//   'KayKit Animated Character|KayKit Animated Character|Shooting(2h': ANIMATION_TYPE.Shooting_02, // remove
//   'KayKit Animated Character|KayKit Animated Character|Throw': ANIMATION_TYPE.Throw, // remove
//   'KayKit Animated Character|KayKit Animated Character|Walk': ANIMATION_TYPE.Walk,
//   'KayKit Animated Character|KayKit Animated Character|Wave': ANIMATION_TYPE.Wave, // remove
// }

export { ANIMATION_TYPE, ANIMATION_BY_REAL_NAME };
