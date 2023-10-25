export const deepCopyArray = (array) => {
  const newArray = [];

  for (let i = 0; i < array.length; i++) {
    newArray.push([...array[i]]);
  }

  return newArray;
}

export const isEqualsPositions = (position1, position2) => {
  return position1.row === position2.row && position1.column === position2.column;
}

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomFromArray = (array) => {
  return array[randomBetween(0, array.length - 1)];
}
