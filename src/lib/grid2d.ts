import { flatten } from 'lodash/fp'

export class Grid2d {
  rows: string[] = []

  constructor(rows: string[]) {
    this.rows = rows
  }

  get width() {
    return this.rows[0] ? this.rows[0].length : 0
  }

  get height() {
    return this.rows.length
  }

  getAt(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined
    }
    return this.rows[y][x]
  }

  setAt(x: number, y: number, value: string) {
    this.rows[y] = this.rows[y].slice(0, x) + value + this.rows[y].slice(x + 1)
  }

  toString() {
    return this.rows.join('\n')
  }

  filterRow(y: number, condition: (x: string) => boolean) {
    return this.rows[y].split('').filter(condition)
  }

  flatten() {
    return this.rows.join('')
  }

  subGrid(x0: number, y0: number) {
    return new Grid2d(this.rows.slice(y0).map((line) => line.slice(x0)))
  }
}

export class Grid2dGeneric<T = number> {
  rows: T[][] = []

  constructor(rows: T[][]) {
    this.rows = rows
  }

  get width() {
    return this.rows[0] ? this.rows[0].length : 0
  }

  get height() {
    return this.rows.length
  }

  getAt(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined
    }
    return this.rows[y][x]
  }

  setAt(x: number, y: number, value: T) {
    this.rows[y][x] = value
  }

  filterRow(y: number, condition: (x: T) => boolean) {
    return this.rows[y].filter(condition)
  }

  clone(value?: T) {
    return new Grid2dGeneric(
      this.rows.map((row) => row.map((x) => (typeof value !== 'undefined' ? value : x)))
    )
  }

  flatten() {
    return flatten(this.rows)
  }

  toString() {
    return this.rows.map((row) => row.join(',')).join('\n')
  }
}
