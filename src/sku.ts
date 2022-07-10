export type SkuNumber = number
export type InternalSkuIndex = number
export type SkuBitArray = Array<boolean>

// A sku. the sku has a name, and an index assigned inside the simulation program.
export type SKU = {
  name: string
  skuNumber: SkuNumber
  internalIndex: InternalSkuIndex
}

// given an array of internal indices, return the actual sku numbers
export const getSkuNumbersFromSkuArray = (input: SkuBitArray, allSkus: Array<SKU>): Array<SkuNumber> => {
  // First parse the indices
  const skuIndices = getSkuIndicesFromSkuArray(input)

  // Then map each index to the real sku number
  return skuIndices.map((skuIndex: number) => { return allSkus[skuIndex].skuNumber })
}

// take a bit array and return an array of indices that are set
// this operates on internal indices
export const getSkuIndicesFromSkuArray = (input: SkuBitArray): Array<InternalSkuIndex> => {
  const indices: Array<number> = []
  for (let i = 0; i < input.length; i++) {
    if (input[i]) { indices.push(i) }
  }
  return indices
}
