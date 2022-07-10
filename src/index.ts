import log from 'loglevel'
import _ from 'lodash'
import { SKU, getSkuIndicesFromSkuArray, getSkuNumbersFromSkuArray, SkuBitArray } from './sku'
import { getPermutations } from './permutations'
import { Order } from './order'

///////////////////////////////////////////////////////////////////////////////////////////
// Types
///////////////////////////////////////////////////////////////////////////////////////////

type SimulationResult = {
  fulfillableOrders: number,
  skus: SkuBitArray
}

///////////////////////////////////////////////////////////////////////////////////////////
// main simulation
///////////////////////////////////////////////////////////////////////////////////////////

const main = () => {
  // TODO(keefertaylor): Parse these
  const orders: Array<Order> = []
  const skus: Array<SKU> = []

  // Run simulation
  const allResults: Array<Array<SimulationResult>> = [[]]
  for (let i = 0; i < skus.length; i++) {
    log.info(`Calculating results for ${i} skus...`)
    allResults.push(findFulfillableOrders(orders, i, skus.length))
  }

  // Find the best results
  const bestResults = allResults.map((simulationResults: Array<SimulationResult>) => { return bestResult(simulationResults) })

  // Pretty print results
  for (let i = 0; i < bestResults.length; i++) {
    const bestResult = bestResults[i]

    log.info(`With ${i} skus the best results are:`)
    log.info(`> Fulfillable Orders: ${bestResult[0].fulfillableOrders}`)
    log.info(`> SKU IDs that can fulfill orders:`)
    for (let j = 0; j < bestResult.length; j++) {
      log.info(`>>> ${JSON.stringify(getSkuNumbersFromSkuArray(bestResult[j].skus, skus))}`)
    }
    log.info('')
  }
}

///////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////////////////////////////////////////////////////////////////////////////

// given an array of simulation results, find the best one.
// this returns an array because there may be ties.
const bestResult = (input: Array<SimulationResult>): Array<SimulationResult> => {
  // TODO(keefertaylor): Process ties?

  let best: SimulationResult = { fulfillableOrders: 0, skus: [] }
  let ties: Array<SimulationResult> = []
  for (let i = 0; i < input.length; i++) {
    const simulationResult = input[i]
    if (simulationResult.fulfillableOrders > best.fulfillableOrders) {
      // High watermark best and reset any ties
      best = simulationResult
      ties = []
    }

    // Capture any ties
    if (simulationResult.fulfillableOrders === best.fulfillableOrders) {
      ties.push(simulationResult)
    }
  }

  const soln = [best, ...ties]

  // sanity check that all solution data is the same order fulfillment quantity
  const first = soln[0].fulfillableOrders
  for (let i = 0; i < soln.length; i++) {
    if (soln[i].fulfillableOrders !== first) { throw new Error('bad tie tracking') }
  }

  return soln
}

/**
 * Get the number of orders that can be fulfilled
 * 
 * @param orders The list of orders to check
 * @param numberSkus The number of skus to use to fulfill
 * @param totalSkus The total number of skus in the system
 */
const findFulfillableOrders = (orders: Array<Order>, numberSkus: number, totalSkus: number): Array<SimulationResult> => {
  // First filter out all orders that can't be fulfilled because they have too many SKUs
  const possibleToBeFulfilled = orders.filter((order: Order) => {
    return order.totalSKUsInOrder < numberSkus
  })
  const unfulfillableCount = orders.length - possibleToBeFulfilled.length
  log.info(`Discarding ${unfulfillableCount} orders, which contain more skus than ${numberSkus}`)

  // Create all permutations of SKUs
  const skuPermutations: Array<SkuBitArray> = getPermutations(numberSkus, totalSkus)

  let results: Array<SimulationResult> = []

  // Loop over each permutation
  for (let i = 0; i < skuPermutations.length; i++) {
    log.debug(`[${i + 1}/${skuPermutations.length}] processing permuation...`)

    // generate data about the sku permutation
    const skuPermutation = skuPermutations[i]
    const skuIndices = getSkuIndicesFromSkuArray(skuPermutation)

    // Sanity check
    if (_.uniq(skuIndices).length !== numberSkus) { throw new Error('bad indices calculation') }

    // discover which orders can be fulfilled
    const fulfillableOrders = possibleToBeFulfilled.filter((order: Order) => {
      return order.canFulfillOrderWithSKUs(skuIndices)
    })

    // bookkeep
    results.push({ fulfillableOrders: fulfillableOrders.length, skus: skuPermutation })
  }

  return results
}

// Run
main()