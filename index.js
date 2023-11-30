// Создаем двумерный массив для хранения информации о занятых клетках
let occupiedCells = []
let energyField = []

const DIRECTION_UP = 0
const DIRECTION_RIGHT = 1
const DIRECTION_DOWN = 2
const DIRECTION_LEFT = 3
const MUTATION_RATE = 0.001
const MAX_LONGEVITI = 32

class Cell {
  constructor(
    x,
    y,
    direction,
    energy,
    color = {
      r: Math.floor(Math.random() * 255),
      g: Math.floor(Math.random() * 255),
      b: Math.floor(Math.random() * 255),
    },
    longeviti = Math.random() * MAX_LONGEVITI
  ) {
    this.position = { x: x, y: y }
    this.energy = energy
    this.direction = direction // 0: вверх, 1: вправо, 2: вниз, 3: влево
    this.color = color
    this.age = 0 //жизненный цикл
    this.testLog = [this.age]
    this.longeviti = longeviti
    this.body = [this.position]
    occupiedCells[this.position.x][this.position.y] = this

    // Создаем геном
    this.genome = Array(1024)
      .fill()
      .map(() => Math.floor(Math.random() * 32))
    this.CI = 0
  }

  display(ctx) {
    ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`
    for (let part of this.body) {
      ctx.fillRect(part.x, part.y, 1, 1)
    }
  }

  incCI(inc = this.genome[this.CI]) {
    this.CI = this.CI + inc
    if (this.CI >= 1024) {
      this.CI = this.CI - 1024
      this.age += 1
      this.testLog.push(
        this.age + "_age____________________energy_" + this.energy
      )
    }
    return this.CI
  }

  setDir(dir) {
    let newX, newY
    switch (dir) {
      case DIRECTION_UP: // Вверх
        newX = this.body[this.body.length - 1].x
        newY = (this.body[this.body.length - 1].y - 1 + height) % height
        break
      case DIRECTION_RIGHT: // Вправо
        newX = (this.body[this.body.length - 1].x + 1 + width) % width
        newY = this.body[this.body.length - 1].y
        break
      case DIRECTION_DOWN: // Вниз
        newX = this.body[this.body.length - 1].x
        newY = (this.body[this.body.length - 1].y + 1 + height) % height
        break
      case DIRECTION_LEFT: // Влево
        newX = (this.body[this.body.length - 1].x - 1 + width) % width
        newY = this.body[this.body.length - 1].y
        break
    }
    return { x: newX, y: newY }
  }

  removeSelf() {
    let index = cells.indexOf(this)
    if (index !== -1) {
      cells.splice(index, 1)
    }
  }

  step() {
    this.energy -= this.age / 100
    if (this.age >= MAX_LONGEVITI) {
      this.energy = 0
    }
    // if (
    //   this.energy >=
    //   32 + this.genome[this.incCI(1)]
    //   // &&
    //   // this.body.length >= 5 + this.genome[this.incCI(1)] / 4
    // ) {
    //   this.reproduction(this.incCI(1))
    //   this.reproduction(this.incCI(1))
    //   this.energy = this.energy / 3
    //   this.incCI(1)
    // }

    switch (this.genome[this.CI]) {
      case 0:
        this.energy -= 0.5
        this.incCI()
        break
      case 1: //повернуться
        this.rotate(this.genome[this.incCI(1)])
        this.incCI(1)
        break
      case 3: //Пустить отросток
        this.grow(this.genome[this.incCI(1)])
        this.incCI(1)
        break
      case 8: //фотосинтез от солнца
        this.photosynthesis(this.genome[this.incCI(1)])
        this.incCI(1)
        break
      case 12: //Размножение
        if (
          this.energy >= 32 + this.genome[this.incCI(1)] &&
          this.body.length >= this.genome[this.incCI(1)]
        ) {
          if (this.genome[this.incCI(1)] > 16) {
            this.reproduction(this.incCI(1))
            this.reproduction(this.incCI(1))
            this.energy = this.energy / 2
          } else {
            this.reproduction(this.incCI(1))
            this.energy = this.energy / 2
            this.incCI(1)
          }
        }
        break
      case 18: //добыча энергии
        this.energyExtraction(this.genome[this.incCI(1)])
        this.incCI(1)
        break
      case 30: //Убить
        this.kill(this.genome[this.incCI(1)])
        this.incCI(1)
        break
      default:
        this.incCI()
    }

    if (this.energy <= 0) {
      const x = this.body[this.body.length - 1].x
      const y = this.body[this.body.length - 1].y
      occupiedCells[x][y] = null
      energyField[x][y] += 0.1
      this.body.pop()
    }

    if (!this.body.length) {
      this.removeSelf()
    }
  }

  kill() {
    const dir = this.setDir(this.direction)
    if (occupiedCells[dir.x][dir.y]) {
      // const enemyBody = occupiedCells[dir.x][dir.y].body
      occupiedCells[dir.x][dir.y].energy = 0
      // occupiedCells[dir.x][dir.y].removeSelf()
      // for (let i = enemyBody.length - 1; i >= 0; i--) {
      //   // console.log(enemyBody.length, i)
      //   const x = enemyBody[i].x
      //   const y = enemyBody[i].y
      //   occupiedCells[x][y] = null
      // }

      // let index = cells.indexOf(occupiedCells[dir.x][dir.y])
      // if (index !== -1) {
      //   this.energy += occupiedCells[dir.x][dir.y].energy / 2 //При убийстве клетки крадёт половину её энергии. Если убивает себя, то тоже крадёт, но это ему не поможет.
      //   cells.splice(index, 1)
      // }

      this.testLog.push(
        "kill " + occupiedCells[dir.x][dir.y] === this ? "self" : "alien"
      )
      // let index = cells.indexOf(occupiedCells[dir.x][dir.y])
      // if (index !== -1) {
      //   this.energy += occupiedCells[dir.x][dir.y].energy / 2 //При убийстве клетки крадёт половину её энергии. Если убивает себя, то тоже крадёт, но это ему не поможет.
      //   cells.splice(index, 1)
      // }
    }
  }

  rotate(direction) {
    this.direction = (this.direction + Math.round((direction + 1) / 8)) % 4
    this.testLog.push("rotate " + this.direction)
  }

  reproduction(direction) {
    const dir = (this.direction + Math.round((direction + 1) / 8)) % 4
    const newDir = this.setDir(dir)

    // Проверяем, занята ли уже эта позиция
    if (!occupiedCells[newDir.x][newDir.y]) {
      this.testLog.push("reproduction successfully" + dir)
      // При репродукции клетки
      let mutation = this.mutateGenome()

      let colorChange = mutation.mutationCount / 5

      let colorChannel = Math.floor(Math.random() * 3)
      let newColor = { ...this.color }
      if (colorChannel === 0) {
        newColor.r = Math.max(0, Math.min(255, this.color.r + colorChange))
      } else if (colorChannel === 1) {
        newColor.g = Math.max(0, Math.min(255, this.color.g + colorChange))
      } else {
        newColor.b = Math.max(0, Math.min(255, this.color.b + colorChange))
      }

      let child = new Cell(newDir.x, newDir.y, dir, this.energy / 2, newColor)
      child.genome = mutation.newGenome
      cells.push(child)
    } else {
      if (occupiedCells[newDir.x][newDir.y] === this) {
        this.testLog.push("reproduction aborted: own cell")
        this.incCI(this.incCI(1))
      } else {
        this.testLog.push("reproduction aborted: alien cell")
        this.incCI(this.incCI(2))
      }
    }
  }

  mutateGenome() {
    let newGenome = [...this.genome]
    let mutationCount = 0
    let newLongeviti = this.longeviti

    if (Math.random() < MUTATION_RATE) {
      newLongeviti += Math.random() * 0.5 - 0.5
    }

    for (let i = 0; i < newGenome.length; i++) {
      if (Math.random() < MUTATION_RATE) {
        let oldGene = newGenome[i]
        newGenome[i] = Math.floor(Math.random() * 32)
        mutationCount += newGenome[i] - oldGene
      }
    }
    return { newGenome, mutationCount, newLongeviti }
  }

  grow(direction) {
    const dir = (this.direction + Math.round((direction + 1) / 8)) % 4
    let newDir = this.setDir(dir)
    this.testLog.push("grow " + dir)

    // Проверяем, занята ли уже эта позиция
    if (!occupiedCells[newDir.x][newDir.y]) {
      this.direction = dir
      this.body.push({ x: newDir.x, y: newDir.y })
      occupiedCells[newDir.x][newDir.y] = this
    } else {
      if (occupiedCells[newDir.x][newDir.y] === this) {
        this.incCI(16)
      } else {
        this.incCI(17)
      }
    }
  }

  energyExtraction(eff) {
    const x = this.body[this.body.length - 1].x
    const y = this.body[this.body.length - 1].y
    if (energyField[x][y] > 0) {
      energyField[x][y] -= 0.2
      this.energy += eff / 8
      this.testLog.push("energy extraction " + eff / 8)
    }
  }

  photosynthesis(eff) {
    this.testLog.push("photosynthesis " + (eff / 1024) * (this.body.length + 1))
    this.energy += (eff / 1024) * (this.body.length + 1)
  }
}

let cells = []
let canvas
let ctx
const width = 960
const height = 640

function setup() {
  canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.style.position = "absolute"
  canvas.style.left = 0
  canvas.style.zIndex = -1
  document.body.appendChild(canvas)
  ctx = canvas.getContext("2d")
  occupiedCells = Array(width)
    .fill()
    .map(() => Array(height).fill(null))
  energyField = Array(width)
    .fill()
    .map(() => Array(height).fill(10))
  for (let i = 0; i < 10000; i++) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    if (!occupiedCells[x][y]) {
      cells.push(new Cell(x, y, Math.floor(Math.random() * 4), 64))
    }
  }
}

let displayStep = 0
let stepCount = 0

let avgEnergy = []
let avgAge = []
let avgLongevity = []
let avgBodyLength = []
let cellCounts = []

const draw = () => {
  if (displayStep >= 20) {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    cells.forEach((cell) => {
      cell.step()
      cell.display(ctx)
    })
    displayStep = 0
  } else {
    cells.forEach((cell) => {
      cell.step()
    })
    displayStep += 1
  }

  // На каждом 1000-м шаге вычисляем средние значения и количество клеток
  if (stepCount % 1000 === 0) {
    let totalEnergy = 0
    let totalAge = 0
    let totalLongevity = 0
    let totalBodyLength = 0

    cells.forEach((cell) => {
      totalEnergy += cell.energy
      totalAge += cell.age
      totalLongevity += cell.longeviti
      totalBodyLength += cell.body.length
    })
    avgEnergy.push(totalEnergy / cells.length)
    avgAge.push(totalAge / cells.length)
    avgLongevity.push(totalLongevity / cells.length)
    avgBodyLength.push(totalBodyLength / cells.length)
    cellCounts.push(cells.length)
  }

  stepCount += 1
}

let energyCanvas = document.createElement("canvas")
energyCanvas.width = width
energyCanvas.height = height
energyCanvas.style.position = "absolute"
energyCanvas.style.left = 0
energyCanvas.style.zIndex = -1
let energyCtx = energyCanvas.getContext("2d")

function drawEnergyField() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let energy = energyField[x][y]
      let color = Math.floor((1 - energy / 10) * 255)
      energyCtx.fillStyle = `rgb(${color}, ${color}, ${color})`
      energyCtx.fillRect(x, y, 1, 1)
    }
  }
}

let occupiedCanvas = document.createElement("canvas")
occupiedCanvas.width = width
occupiedCanvas.height = height
occupiedCanvas.style.position = "absolute"
occupiedCanvas.style.left = 0
occupiedCanvas.style.zIndex = -1
let occupiedCtx = occupiedCanvas.getContext("2d")

function drawOccupiedField() {
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let color = occupiedCells[x][y] ? "red" : "white"
      occupiedCtx.fillStyle = color
      occupiedCtx.fillRect(x, y, 1, 1)
    }
  }
}

// function saveEnergyField() {
//   drawEnergyField()
//   let dataUrl = energyCanvas.toDataURL("image/png")
//   let a = document.createElement("a")
//   a.href = dataUrl
//   a.download = "energyField.png"
//   a.click()
// }

// let saveButton = document.createElement("button")
// saveButton.textContent = "Energy Field"
// saveButton.addEventListener("click", saveEnergyField)
// document.body.appendChild(saveButton)

let showEnergyCanvasButton = document.createElement("button")
showEnergyCanvasButton.textContent = "Energy Field"
showEnergyCanvasButton.addEventListener("click", () => {
  if (document.body.contains(energyCanvas)) {
    document.body.removeChild(energyCanvas)
  } else {
    drawEnergyField()
    document.body.appendChild(energyCanvas)
  }
})

let showOccupiedCanvasButton = document.createElement("button")
showOccupiedCanvasButton.textContent = "Occupied Field"
showOccupiedCanvasButton.addEventListener("click", () => {
  if (document.body.contains(occupiedCanvas)) {
    document.body.removeChild(occupiedCanvas)
  } else {
    drawOccupiedField()
    document.body.appendChild(occupiedCanvas)
  }
})

document.body.appendChild(showEnergyCanvasButton)
document.body.appendChild(showOccupiedCanvasButton)

setup()

setInterval(draw, 1)
