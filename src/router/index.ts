import Home from '../views/home/index.vue';
import Login from '../views/login/index.vue';
export default [
  {
    path: '/',
    name: '/home',
    component: Home,
  },
  {
    path: '/login',
    name: '/login',
    component: Login,
  },
];
