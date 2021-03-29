<template>
  <div class="container my-2">
    <h3 class="text-center text-muted">Global</h3>
    <ChartComponent :datasets="globalDataSets" :labels="globalLabels"></ChartComponent>
    <div class="mt-5"></div>
    <h3 class="text-center text-muted">Countries</h3>
    <ChartComponent :labels="globalLabels"></ChartComponent>
  </div>
</template>

<script>

import ChartComponent from "../components/ChartComponent";

export default {
  components: {ChartComponent},
  data() {
    return {
      globalLabels: [],
      globalDataSets: []
    };
  },
  methods: {
    async getData() {
      const response = await this.$http.get('http://localhost:8080/api/covid');
      return response.data;
    },
    buildLabels(data = []) {
      return data.map(value => value.time);
    },
    buildDataSets(data = [], mainKey = 'globals') {
      const labels = [
        {key: 'cases', name: 'Cases', color: '#ffc107'},
        {key: 'deaths', name: 'Deaths', color: '#dc3545'},
        {key: 'recovered', name: 'Recovered', color: '#28a745'}
      ];
      return labels.map(label => {
        return {
          label: label.name,
          borderColor: label.color,
          backgroundColor: label.color,
          fill: false,
          data: data.map(value => {
            return parseInt(value[mainKey][label.key]);
          })
        };
      });
    }
  },
  async created() {
    const data = await this.getData();
    this.globalLabels = this.buildLabels(data);
    this.globalDataSets = this.buildDataSets(data, 'globals');
  }
};
</script>

<style scoped>

</style>
