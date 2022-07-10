import _ from 'lodash'

///////////////////////////////////////////////////////////////////////////////////////////
// Permutation Logic
///////////////////////////////////////////////////////////////////////////////////////////

// Get all permutations of a string with the given length and given number of 1s.
// See https://stackoverflow.com/questions/32001426/permutations-of-1s-and-0s
export const getPermutations = (numberOfOnes: number, length: number): Array<Array<boolean>> => {
  // We use strings to make data manipulation easier to reason about, then convert into a bit array.

  // Build a string of zeros
  let start = ''
  for (let i = 0; i < length; i++) {
    start = `${start}0`
  }

  // Generate all permutations
  const permutations = permutate(numberOfOnes, 0, 0, length, start)

  // Sanity check:
  // 1. All strings in array should be unique
  // 2. The array should be the length of the binomial coefficient.
  const uniquePermutations = _.uniq(permutations)
  if (uniquePermutations.length !== permutations.length) { throw new Error('found duplicate permutations!') }
  const expectedLength = factorial(length) / (factorial(numberOfOnes) * factorial(length - numberOfOnes))
  if (permutations.length !== expectedLength) { throw new Error('Did not create expected number of permutaions!') }

  // Map all strings to bit arrays
  return permutations.map((permuationString: string) => { return stringToBitArray(permuationString) })
}

// Core permutation logic, taken from stack overflow. 
// See https://stackoverflow.com/questions/32001426/permutations-of-1s-and-0s
const permutate = (numberOfOnes: number, first: number, depth: number, length: number, base: string): Array<string> => {
  const results: Array<string> = []

  for (let x = first; x < length; x++) {
    const working = replaceCharAt(base, x, '1')

    if (numberOfOnes === depth + 1) {
      results.push(working)
    } else {
      results.push(...permutate(numberOfOnes, x + 1, depth + 1, length, working))
    }
  }
  return results
}

// take a string of 1s and 0s and convert to a bit array
const stringToBitArray = (input: string): Array<boolean> => {
  const result: Array<boolean> = []
  for (let i = 0; i < input.length; i++) {
    result.push(input.charAt(i) === "1")
  }
  return result
}

// Helper to swap a character in a string since node doesn't support this out of the box.
// See: https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
const replaceCharAt = (original: string, index: number, replacement: string): string => {
  if (replacement.length !== 1) { throw new Error('can only replace 1 char at a time') }
  return `${original.substring(0, index)}${replacement}${original.substring(index + replacement.length)}`
}

// Calculate a factorial
const factorial = (n: number): number => {
  if (n < 0) { throw new Error('negative factorial!') }
  if (n === 1) { return 1 }
  return n * factorial(n - 1)
}

