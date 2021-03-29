<template>
  <canvas :id="chartId"></canvas>
</template>

<script>
import Chart from 'chart.js';
import {v4 as uuidv4} from 'uuid';

export default {
  name: 'ChartComponent',
  props: {
    labels: {
      type: Array,
      required: false
    },
    datasets: {
      type: Array,
      required: false
    }
  },
  watch: {
    labels: {
      handler(value) {
        this.chart.data.labels = value;
        this.chart.update();
      }
    },
    datasets: {
      handler(value) {
        this.chart.data.datasets = value;
        this.chart.update();
      }
    }
  },
  data() {
    return {
      chartId: uuidv4(),
      chart: undefined
    };
  },
  methods: {
    create() {
      const vm = this;
      this.chart = new Chart(this.chartId, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: this.datasets
        },
        options: {
          animation: 0,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                callback(value) {
                  return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                }
              }
            }],
            xAxes: [{
              ticks: {
                callback(value, index) {
                  if (index % 10 === 0) {
                    return vm.$moment.unix(value).format('DD/MM/YYYY H:mm');
                  }
                  return null;
                },
                maxRotation: 0,
                minRotation: 0
              }
            }],
          },
          tooltips: {
            callbacks: {
              title(tooltipItems) {
                return vm.$moment.unix(tooltipItems[0].xLabel).format('DD/MM/YYYY H:mm:ss');
              },
              label(tooltipItems, data) {
                const label = data.datasets[tooltipItems.datasetIndex].label;
                const value = tooltipItems.yLabel.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
                return label + ': ' + value;
              }
            }
          }
        }
      });
    },
  },
  mounted() {
    this.create();
  }
};
</script>

<style scoped>

</style>
