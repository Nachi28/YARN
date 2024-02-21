document.addEventListener('DOMContentLoaded', function () {
  const chartContainer = document.getElementById('chartContainer');
  const memoryCardChartCanvas = document.getElementById('memoryCardChart');
  const sudokuChartCanvas = document.getElementById('sudokuChart');

  const createMemoryCardGraphBtn = document.getElementById('createMemoryCardGraphBtn');
  const createSudokuGraphBtn = document.getElementById('createSudokuGraphBtn');

  createMemoryCardGraphBtn.addEventListener('click', function () {
    createGraph('memoryCards', memoryCardChartCanvas, sudokuChartCanvas);
  });

  createSudokuGraphBtn.addEventListener('click', function () {
    createGraph('sudoku', sudokuChartCanvas, memoryCardChartCanvas);
  });

  function createGraph(gameType, canvasToShow, canvasToHide) {
    const user = JSON.parse(document.getElementById('userData').dataset.user);
    const scores = user.games[gameType];
    const timestamps = scores.map(score => moment(score.timestamp).format('DD-MM-YYYY (H:mm:ss)')); // Format timestamps
    const times = scores.map(score => score.time);

    // Hide the canvas and clear it
    canvasToHide.parentElement.style.display = 'none';
    const ctx = canvasToHide.getContext('2d');
    ctx.clearRect(0, 0, canvasToHide.width, canvasToHide.height);

    // Show the chart container if hidden
    if (chartContainer.style.display === 'none') {
      chartContainer.style.display = 'block';
    }

    // Show chart canvas
    canvasToShow.parentElement.style.display = 'block';

    // Set canvas size
    canvasToShow.width = 400;
    canvasToShow.height = 300;

    new Chart(canvasToShow, {
      type: 'line',
      data: {
        labels: timestamps, // Use formatted timestamps for x-axis
        datasets: [{
          label: `${gameType} Time`,
          data: times,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            type: 'category', // Specify x-axis type as category for custom labels
            labels: timestamps, // Use formatted timestamps for labels
            title: { display: true, text: 'Timestamp' },
            ticks: {
              autoSkip: false, // Disable auto-skipping of labels
              maxRotation: 45, // Rotate labels to 45 degrees
              minRotation: 45 // Rotate labels to 45 degrees
            }
          },
          y: { title: { display: true, text: 'Time (s)' } }
        }
      }
    });
  }
});
