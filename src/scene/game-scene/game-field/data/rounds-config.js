import { ROUND_OBSTACLES_TYPE } from "../obstacles/data/obstacles-config";
import { ROUND_TYPE } from "./rounds-data";

const ROUNDS_CONFIG = [
  // Round 1
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [1, 1, 0], // Ghost, EvilPumpkin, Skeleton
    score: { perSecond: 5, consumables: [50, 200, 500] },
  },
  // Round 2
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [2, 1, 0],
    score: { perSecond: 5, consumables: [50, 200, 500] },
  },
  // Round 3
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [2, 1, 1],
    score: { perSecond: 5, consumables: [50, 200, 500] },
  },
  // Round 4
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 1, 0],
    score: { perSecond: 5, consumables: [50, 200, 500] },
  },
  // Round 5
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 2, 0],
    score: { perSecond: 5, consumables: [50, 200, 500] },
  },
  // Round 6
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 2, 1],
    score: { perSecond: 7, consumables: [75, 300, 750] },
  },
  // Round 7
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 2, 1],
    score: { perSecond: 7, consumables: [75, 300, 750] },
  },
  // Round 8
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 2, 2],
    score: { perSecond: 7, consumables: [75, 300, 750] },
  },
  // Round 9
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 2, 2],
    score: { perSecond: 7, consumables: [75, 300, 750] },
  },
  // Round 10
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [0, 1, 0],
    score: { perSecond: 7, consumables: [75, 300, 750] },
  },
  // Round 11
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 2, 2],
    score: { perSecond: 10, consumables: [100, 400, 1000] },
  },
  // Round 12
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 2],
    score: { perSecond: 10, consumables: [100, 400, 1000] },
  },
  // Round 13
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 4, 2],
    score: { perSecond: 10, consumables: [100, 400, 1000] },
  },
  // Round 14
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 5, 1],
    score: { perSecond: 10, consumables: [100, 400, 1000] },
  },
  // Round 15
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 6, 1],
    score: { perSecond: 10, consumables: [100, 400, 1000] },
  },
  // Round 16
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 2, 2],
    score: { perSecond: 13, consumables: [150, 600, 1500] },
  },
  // Round 17
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 2, 3],
    score: { perSecond: 13, consumables: [150, 600, 1500] },
  },
  // Round 18
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 2, 4],
    score: { perSecond: 13, consumables: [150, 600, 1500] },
  },
  // Round 19
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 2, 4],
    score: { perSecond: 13, consumables: [150, 600, 1500] },
  },
  // Round 20
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [0, 0, 1],
    score: { perSecond: 13, consumables: [150, 600, 1500] },
  },
  // Round 21
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 3, 3],
    score: { perSecond: 15, consumables: [200, 800, 2000] },
  },
  // Round 22
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 3],
    score: { perSecond: 15, consumables: [200, 800, 2000] },
  },
  // Round 23
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 4, 3],
    score: { perSecond: 15, consumables: [200, 800, 2000] },
  },
  // Round 24
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 4, 3],
    score: { perSecond: 15, consumables: [200, 800, 2000] },
  },
  // Round 25
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 5, 3],
    score: { perSecond: 15, consumables: [200, 800, 2000] },
  },
  // Round 26
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 3, 4],
    score: { perSecond: 20, consumables: [300, 1000, 2500] },
  },
  // Round 27
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 3, 5],
    score: { perSecond: 20, consumables: [300, 1000, 2500] },
  },
  // Round 28
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 3, 6],
    score: { perSecond: 20, consumables: [300, 1000, 2500] },
  },
  // Round 29
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 6],
    score: { perSecond: 20, consumables: [300, 1000, 2500] },
  },
  // Round 30
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [1, 0, 0],
    score: { perSecond: 20, consumables: [300, 1000, 2500] },
  },
  // Round 31
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [3, 2, 2],
    score: { perSecond: 25, consumables: [400, 1300, 3500] },
  },
  // Round 32
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 2, 2],
    score: { perSecond: 25, consumables: [400, 1300, 3500] },
  },
  // Round 33
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 2],
    score: { perSecond: 25, consumables: [400, 1300, 3500] },
  },
  // Round 34
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 3],
    score: { perSecond: 25, consumables: [400, 1300, 3500] },
  },
  // Round 35
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 3, 3],
    score: { perSecond: 25, consumables: [400, 1300, 3500] },
  },
  // Round 36
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 4, 3],
    score: { perSecond: 30, consumables: [500, 1600, 4500] },
  },
  // Round 37
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 4, 4],
    score: { perSecond: 30, consumables: [500, 1600, 4500] },
  },
  // Round 38
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [6, 4, 4],
    score: { perSecond: 30, consumables: [500, 1600, 4500] },
  },
  // Round 39
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [6, 5, 4],
    score: { perSecond: 30, consumables: [500, 1600, 4500] },
  },
  // Round 40
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [1, 1, 1],
    score: { perSecond: 30, consumables: [500, 1600, 4500] },
  },
  // Round 41
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [4, 3, 3],
    score: { perSecond: 35, consumables: [600, 1800, 6000] },
  },
  // Round 42
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 3, 3],
    score: { perSecond: 35, consumables: [600, 1800, 6000] },
  },
  // Round 43
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 4, 3],
    score: { perSecond: 35, consumables: [600, 1800, 6000] },
  },
  // Round 44
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [5, 4, 4],
    score: { perSecond: 35, consumables: [600, 1800, 6000] },
  },
  // Round 45
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [6, 4, 4],
    score: { perSecond: 35, consumables: [600, 1800, 6000] },
  },
  // Round 46
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [7, 4, 4],
    score: { perSecond: 40, consumables: [700, 2000, 8000] },
  },
  // Round 47
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [7, 5, 4],
    score: { perSecond: 40, consumables: [700, 2000, 8000] },
  },
  // Round 48
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [8, 5, 4],
    score: { perSecond: 40, consumables: [700, 2000, 8000] },
  },
  // Round 49
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [9, 5, 4],
    score: { perSecond: 40, consumables: [700, 2000, 8000] },
  },
  // Round 50
  {
    type: ROUND_TYPE.Normal,
    duration: 20000,
    obstacles: ROUND_OBSTACLES_TYPE.Random,
    enemies: [9, 5, 5],
    score: { perSecond: 100, consumables: [1000, 2500, 10000] },
  },
]

export { ROUNDS_CONFIG };
