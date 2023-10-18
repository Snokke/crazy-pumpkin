export const deepCopyArray = (array) => {
  const newArray = [];

  for (let i = 0; i < array.length; i++) {
    newArray.push([...array[i]]);
  }

  return newArray;
}