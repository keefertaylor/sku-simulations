import { SKU, InternalSkuIndex, SkuBitArray } from './sku'
import log from 'loglevel'

/** Represents an order and some derived helper methods */
export class Order {
  /** Order ID */
  public readonly orderID: string

  /** Bit array of SKUs */
  private readonly skus: SkuBitArray

  /** Total SKUs in order */
  public readonly totalSKUsInOrder: number

  private constructor() {
    this.orderID = "mock"
    this.skus = []
    this.totalSKUsInOrder = 0
  }

  skusInOrder(): Array<InternalSkuIndex> {
    const skuIDs: Array<InternalSkuIndex> = []
    for (let i = 0; i < this.skus.length; i++) {
      if (this.skus[i]) {
        skuIDs.push(i)
      }
    }
    return skuIDs
  }

  canFulfillOrderWithSKUs = (skusToFulfillWith: Array<InternalSkuIndex>): boolean => {
    // If there are too many products, we can't do anything.
    if (this.totalSKUsInOrder > skusToFulfillWith.length) {
      log.debug(`Cannot fulfill ${this.orderID} because it contains more products than skus.`)
      return false
    }

    // Otherwise, get the SKUs in the order and determine if every sku in the order is in the array of skus
    const skusInOrder = this.skusInOrder()
    for (let i = 0; i < skusInOrder.length; i++) {
      const skuInOrder = skusInOrder[i]
      if (!skusToFulfillWith.includes(skuInOrder)) {
        return false
      }
    }

    // All checks have passed, we can fulfill!
    return true
  }
}