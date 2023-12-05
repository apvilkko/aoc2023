export const splitLines = (data: string) => data.split('\r\n').filter((x) => !!x)

export const splitMultilines = (data: string) =>
  data
    .trim()
    .split('\r\n\r\n')
    .filter((x) => !!x)

export const splitNumbers = (data: string, separator = ' ') =>
  data
    .split(separator)
    .filter((x) => !!x)
    .map((x) => Number(x))
