const drawGraph = (data, color, canvasId) => {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext("2d")

  // Очистка холста
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Масштабирование холста по y
  canvas.width = Math.max(data.length, 320)
  canvas.height = 160

  const maxValue = Math.max(...data)
  const yScaleFactor = canvas.height / maxValue

  // Масштабирование по оси x
  const xScaleFactor = canvas.width / (data.length - 1)

  ctx.beginPath()
  ctx.strokeStyle = color

  data.forEach((value, index) => {
    ctx.lineTo(index * xScaleFactor, canvas.height - value * yScaleFactor)
  })

  ctx.stroke()
}

const drawAllGraphs = (dataArrays, colors, canvasId) => {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext("2d")

  // Очистка холста
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Масштабирование холста
  canvas.width = Math.max(Math.max(...dataArrays.map((arr) => arr.length)), 320)
  canvas.height = 160

  // Масштабирование по оси x
  const xScaleFactor =
    canvas.width / (Math.max(...dataArrays.map((arr) => arr.length)) - 1)

  dataArrays.forEach((data, dataIndex) => {
    const maxValue = Math.max(...data)
    const scaleFactor = canvas.height / maxValue

    ctx.beginPath()
    ctx.strokeStyle = colors[dataIndex]

    data.forEach((value, index) => {
      ctx.lineTo(index * xScaleFactor, canvas.height - value * scaleFactor)
    })

    ctx.stroke()
  })
}

const graphContainer = document.getElementById("graphContainer")
graphContainer.style.display = "none"

const drawButtonHandler = () => {
  if (graphContainer.style.display === "none") {
    graphContainer.style.display = "flex"
    drawGraph(avgEnergy, "red", "canvasEnergy")
    drawGraph(avgAge, "green", "canvasAge")
    drawGraph(avgLongevity, "blue", "canvasLongevity")
    drawGraph(avgBodyLength, "black", "canvasBodyLength")
    drawGraph(cellCounts, "purple", "canvasCounts")
    drawAllGraphs(
      [avgEnergy, avgAge, avgLongevity, avgBodyLength, cellCounts],
      ["red", "green", "blue", "black", "purple"],
      "canvasAll"
    )
  } else {
    graphContainer.style.display = "none"
  }
}
