import { createApp } from 'vue';
import APP from './APP.vue';
import routes from './router';
import { createWebHashHistory, createRouter } from 'vue-router';
function start(): void {
  const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const app = createApp(APP);
  app.use(router);
  app.mount('#app');
}
start();
