export type Nmc = MapCell | undefined | boolean

export const dirMap: Array<[string, string, number, number]> = [
  ['n', 's', 0, -1],
  ['s', 'n', 0, 1],
  ['w', 'e', -1, 0],
  ['e', 'w', 1, 0]
]

export const directions: string[] = dirMap.map((x) => x[0])

export class MapCell {
  n: Nmc = undefined
  w: Nmc = undefined
  e: Nmc = undefined
  s: Nmc = undefined
  x: number = -1
  y: number = -1
  value: number = 0
  parent: MapCell | undefined = undefined

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  get coords() {
    return [this.x, this.y]
  }

  get hasPipes() {
    return !!this.n || !!this.s || !!this.w || !!this.e
  }
}

export class PipeMap {
  matrix: Array<MapCell> = []
  rowLen: number = 0
  height: number = 0
  start: [number, number] = [-1, -1]

  constructor(cells: Array<Array<[string, string] | 'S'>>) {
    this.rowLen = cells[0].length
    for (let y = 0; y < cells.length; ++y) {
      for (let x = 0; x < cells[y].length; ++x) {
        this.matrix.push(new MapCell(x, y))
      }
    }
    this.height = this.matrix.length / this.rowLen

    for (let y = 0; y < cells.length; ++y) {
      for (let x = 0; x < cells[y].length; ++x) {
        const cell = cells[y][x]
        if (cell === 'S') {
          this.start = [x, y]
        } else if (cell === '.' || cell === 'I' || cell === 'O') {
          continue
        } else {
          const c = this.getAt(x, y)
          cell.forEach((dir) => {
            dirMap.forEach((dm) => {
              const [d, opposite, xd, yd] = dm
              const x1 = x + xd
              const y1 = y + yd
              if (dir === d) {
                const target = this.getAt(x1, y1)
                if (target) {
                  const targetDirs = cells[y1][x1]
                  if (targetDirs.includes(opposite)) {
                    c[d] = target
                    target[opposite] = c
                  } else {
                    c[d] = true
                  }
                } else {
                  c[d] = true
                }
              }
            })
          })
        }
      }
    }

    const startCell = this.getIndex(this.startIndex)
    dirMap.forEach((dm) => {
      const [d, opposite, xd, yd] = dm
      const x1 = this.start[0] + xd
      const y1 = this.start[1] + yd
      const target = this.getAt(x1, y1)
      if (target) {
        const targetDirs = cells[y1][x1]
        if (targetDirs.includes(opposite)) {
          startCell[d] = target
          target[opposite] = startCell
        }
      }
    })
  }

  getAt(x: number, y: number) {
    if (x < 0 || y < 0 || x > this.rowLen - 1) {
      return undefined
    }
    return this.matrix[this.rowLen * y + x]
  }

  getIndex(i: number) {
    return this.matrix[i]
  }

  get startIndex() {
    return this.start[1] * this.rowLen + this.start[0]
  }

  toString() {
    return this.matrix.map((x) => x.toString())
  }

  filter(condition: (x: MapCell) => boolean) {
    return this.matrix.filter(condition)
  }
}
