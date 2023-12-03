/**
     * The Quadtree uses rectangle objects for all areas ("Rect").
     * All rectangles require the properties x, y, width, height
     * @typedef {Object} Rect
     * @property {number} x         X-Position
     * @property {number} y         Y-Position
     * @property {number} width     Width
     * @property {number} height    Height
     */

/**
     * Quadtree Constructor
     * @class Quadtree
     * @param {Rect} bounds                 bounds of the node ({ x, y, width, height })
     * @param {number} [maxObjects=10]     (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
     * @param {number} [maxLevels=4]       (optional) total max levels inside root Quadtree (default: 4)
     * @param {number} [level=0]            (optional) depth level, required for subnodes (default: 0)
     */
export default function Quadtree (bounds, maxObjects, maxLevels, level) {
  this.maxObjects = maxObjects || 10
  this.maxLevels = maxLevels || 4

  this.level = level || 0
  this.bounds = bounds

  this.objects = []
  this.nodes = []
};

/**
   * Split the node into 4 subnodes
   * @memberof Quadtree
   */
Quadtree.prototype.split = function () {
  const nextLevel = this.level + 1,
    subWidth = this.bounds.width / 2,
    subHeight = this.bounds.height / 2,
    x = this.bounds.x,
    y = this.bounds.y

  // top right node
  this.nodes[0] = new Quadtree({
    x: x + subWidth,
    y: y,
    width: subWidth,
    height: subHeight
  }, this.maxObjects, this.maxLevels, nextLevel)

  // top left node
  this.nodes[1] = new Quadtree({
    x: x,
    y: y,
    width: subWidth,
    height: subHeight
  }, this.maxObjects, this.maxLevels, nextLevel)

  // bottom left node
  this.nodes[2] = new Quadtree({
    x: x,
    y: y + subHeight,
    width: subWidth,
    height: subHeight
  }, this.maxObjects, this.maxLevels, nextLevel)

  // bottom right node
  this.nodes[3] = new Quadtree({
    x: x + subWidth,
    y: y + subHeight,
    width: subWidth,
    height: subHeight
  }, this.maxObjects, this.maxLevels, nextLevel)
}

/**
   * Determine which node the object belongs to
   * @param {Rect} pRect      bounds of the area to be checked ({ x, y, width, height })
   * @return {number[]}       an array of indexes of the intersecting subnodes (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
   * @memberof Quadtree
   */
Quadtree.prototype.getIndex = function (pRect) {
  const indexes = [],
    verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
    horizontalMidpoint = this.bounds.y + (this.bounds.height / 2)

  const startIsNorth = pRect.y < horizontalMidpoint,
    startIsWest = pRect.x < verticalMidpoint,
    endIsEast = pRect.x + pRect.width > verticalMidpoint,
    endIsSouth = pRect.y + pRect.height > horizontalMidpoint

  // top-right quad
  if (startIsNorth && endIsEast) {
    indexes.push(0)
  }

  // top-left quad
  if (startIsWest && startIsNorth) {
    indexes.push(1)
  }

  // bottom-left quad
  if (startIsWest && endIsSouth) {
    indexes.push(2)
  }

  // bottom-right quad
  if (endIsEast && endIsSouth) {
    indexes.push(3)
  }

  return indexes
}

/**
   * Insert the object into the node. If the node
   * exceeds the capacity, it will split and add all
   * objects to their corresponding subnodes.
   * @param {Rect} pRect      bounds of the object to be added ({ x, y, width, height })
   * @memberof Quadtree
   */
Quadtree.prototype.insert = function (pRect) {
  let i = 0,
    indexes

  // if we have subnodes, call insert on matching subnodes
  if (this.nodes.length) {
    indexes = this.getIndex(pRect)

    for (i = 0; i < indexes.length; i++) {
      this.nodes[indexes[i]].insert(pRect)
    }
    return
  }

  // otherwise, store object here
  this.objects.push(pRect)

  // maxObjects reached
  if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
    // split if we don't already have subnodes
    if (!this.nodes.length) {
      this.split()
    }

    // add all objects to their corresponding subnode
    for (i = 0; i < this.objects.length; i++) {
      indexes = this.getIndex(this.objects[i])
      for (let k = 0; k < indexes.length; k++) {
        this.nodes[indexes[k]].insert(this.objects[i])
      }
    }

    // clean up this node
    this.objects = []
  }
}

/**
   * Return all objects that could collide with the given object
   * @param {Rect} pRect      bounds of the object to be checked ({ x, y, width, height })
   * @return {Rect[]}         array with all detected objects
   * @memberof Quadtree
   */
Quadtree.prototype.retrieve = function (pRect) {
  const indexes = this.getIndex(pRect)
  let returnObjects = this.objects

  // if we have subnodes, retrieve their objects
  if (this.nodes.length) {
    for (let i = 0; i < indexes.length; i++) {
      returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect))
    }
  }

  // remove duplicates, detect collisions
  returnObjects = Array.from(new Set(returnObjects))

  return returnObjects
}

/**
   * Clear the quadtree
   * @memberof Quadtree
   */
Quadtree.prototype.clear = function () {
  this.objects = []

  for (let i = 0; i < this.nodes.length; i++) {
    if (this.nodes.length) {
      this.nodes[i].clear()
    }
  }

  this.nodes = []
}

Quadtree.prototype[Symbol.iterator] = function * () {
  yield * this.objects
  for (const node of this.nodes) {
    yield * node
  }
}

// export for commonJS or browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Quadtree
} else {
  window.Quadtree = Quadtree
}

export class RectQuadtree extends Quadtree {
  retrieve (pRect) {
    return super.retrieve(pRect).filter(oRect =>
      oRect.x < pRect.x + pRect.width &&
      oRect.x + oRect.width > pRect.x &&
      oRect.y < pRect.y + pRect.height &&
      oRect.height + oRect.y > pRect.y
    )
  }
}

/**
 * @typedef Circle
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 */

export class CircleQuadtree extends Quadtree {
  /**
   * @param {Circle} circle
  */
  insert (circle) {
    const pRect = {
      x: circle.x - circle.radius,
      y: circle.y - circle.radius,
      width: circle.radius * 2,
      height: circle.radius * 2,
      circle
    }

    super.insert(pRect)
  }

  /**
   * @param {Circle} circle
   * @returns {Circle[]}
  */
  retrieve (circle) {
    const pRect = {
      x: circle.x - circle.radius,
      y: circle.y - circle.radius,
      width: circle.radius * 2,
      height: circle.radius * 2,
      circle
    }
    return super.retrieve(pRect).filter(({ circle: oCircle }) =>
      Math.pow(circle.x - oCircle.x, 2) + Math.pow(circle.y - oCircle.y, 2) < Math.pow(circle.radius + oCircle.radius, 2)
    )
  }

  *[Symbol.iterator] () {
    for (const rect of super[Symbol.iterator]()) {
      yield rect.circle
    }
  }
}
