const drawGraph = (data, color, canvasId) => {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext("2d")

  // Очистка холста
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Масштабирование холста
  canvas.width = Math.max(data.length, 480)
  canvas.height = 160

  const maxValue = Math.max(...data)
  const scaleFactor = canvas.height / maxValue

  ctx.beginPath()
  ctx.strokeStyle = color

  data.forEach((value, index) => {
    ctx.lineTo(index, canvas.height - value * scaleFactor)
  })

  ctx.stroke()
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
  } else {
    graphContainer.style.display = "none"
  }
}
