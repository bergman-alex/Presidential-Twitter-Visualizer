createChart();

const xlabels = [];
const ylabels = [];

async function getData()
{
  const response = await fetch('testtweets.csv');
  const data = await response.text();
  //console.log(data);

  const rows = data.split('\n').slice(1);

  rows.forEach(element =>
  {
    const row = element.split(',');
    const date = row[0];
    const likes = row[3];

    xlabels.push(date);
    ylabels.push(likes);

    //var dataArray = date.map((x, i) => ({x, y: likes[i]}));
  })
}

async function createChart()
{
  await getData();

  var timeFormat = 'YYYY-MM-DD HH:mm'
  console.log(xlabels);

  var chart = document.getElementById('chart').getContext('2d');
  var myChart = new Chart(chart, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Scatter Dataset',
        data: [{x: xlabels, y: ylabels}]
      }]
    },
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            displayFormats: {
              quarter: timeFormat
            }
          }
        }]
      }
    }
  });
}
