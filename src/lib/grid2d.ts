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
}
