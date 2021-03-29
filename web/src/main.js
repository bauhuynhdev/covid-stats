import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import jQuery from 'jquery/dist/jquery';
import moment from 'moment';
import momentTz from 'moment-timezone';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'popper.js/dist/popper';
import 'bootstrap/dist/js/bootstrap';

axios.interceptors.response.use(response => {
    return response.data;
});
Vue.prototype.$http = axios;

window.$ = jQuery;

moment.prototype.tz = momentTz;
Vue.prototype.$moment = moment;

Vue.config.productionTip = false;

String.prototype.capitalize = () => {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toDecimal = () => {
    return this.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
};

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
