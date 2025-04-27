/**
 * Calculate the Frobenius norm of a 2D array
 * @param {number[][]} arr A 2D array
 * @returns The Frobenius norm of the array (the square root of the sum of the squares of its elements)
 */
function calculateFrobeniusNorm2D(arr) {
  const sum_of_squares = arr.reduce((acc, row) => {
    return acc + row.reduce((row_acc, value) => row_acc + Math.pow(value, 2), 0);
  }, 0);
  return Math.sqrt(sum_of_squares);
}

/**
 * Create an 2D array (matrix) of random values
 * @param {number} rows The number of rows in the array 
 * @param {number} cols The number of columns in the array 
 * @returns A 2D array of random values
 */
function createRandom2dArray(rows, cols) {
  return Array(rows).fill(null).map(() => {
    return Array(cols).fill(null).map(() => Math.random());
  });
}

/**
 * Takes two n-dimensional arrays and subtracts the second from the first element-wise
 * @param {number[][]} arr1 An n-dimensional array
 * @param {number[][]} arr2 An array with the same shape as arr1
 * @returns An n-dimensional array with the same shape as arr1 and arr2, where each element is the result of arr1[i][j] - arr2[i][j]
 */
function elementWiseSubtract(arr1, arr2) {
  if (arr1.length !== arr2.length) { throw new Error("Arrays must have the same length"); }
  if (!Array.isArray(arr1[0]) || !Array.isArray(arr2[0])) {
    return arr1.map((value, index) => value - arr2[index]);
  } else {
    return arr1.map((value, index) => elementWiseSubtract(value, arr2[index]));
  }
}

/**
 * Normalize a vector such that its length equals 1
 * @param {number[]} vector An array of numbers
 * @returns The vector normalized to length 1
 */
function normalizeVector(vector) {
  const norm = Math.sqrt(vector.reduce((acc, value) => acc + Math.pow(value, 2), 0));
  return vector.map(value => value / norm);
}

/**
 * Normalize a vector such that the sum of its elements equals 1
 * @param {number[]} vector An array of numbers
 * @returns A normalized array where the sum of its elements equals 1
 */
function normalizeVectorSum(vector) {
  const sum = vector.reduce((acc, value) => acc + value, 0);
  return vector.map(value => value / sum);
}
