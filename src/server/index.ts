const express = require('express')
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')
const uniq = require('lodash').uniq

const app = express()
app.use(bodyParser.json())

const dataFolder = path.resolve(__dirname, 'data')
const files = fs.readdirSync(dataFolder)

app.get('/day', (req, res) => {
  const days = uniq(files.map((x) => x.split('_')[0])).map((x) =>
    Number(x.startsWith('0') ? x[1] : x)
  )
  res.send(JSON.stringify(days))
})

app.get('/day/:day', (req, res) => {
  const { day } = req.params
  const variants = files.filter((x) => x.startsWith(day)).map((x) => x.split('.')[0].slice(3))

  res.send(JSON.stringify(variants))
})

app.get('/day/:day/:variant', (req, res) => {
  const { day, variant } = req.params
  const filename = `${day}_${variant}.txt`
  if (!files.includes(filename)) {
    res.sendStatus(404)
    return
  }
  const data = fs.readFileSync(path.join(dataFolder, filename), 'utf-8')
  res.send(String(data))
})

app.listen('3001', () => console.log('listening at 3001'))
