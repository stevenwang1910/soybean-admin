import { createApp } from 'vue';
import './plugins/assets';
import {
  setupAppVersionNotification,
  setupDayjs,
  setupIconifyOffline,
  setupLoading,
  setupNProgress,
  setupProNaiveComponents
} from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import { usePropertyPermissionStore } from './store/modules/propertyPermission';
import App from './App.vue';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  setupStore(app);

  // 加载属性权限配置
  const propertyPermissionStore = usePropertyPermissionStore();
  await propertyPermissionStore.loadAllProperties();

  await setupRouter(app);

  setupProNaiveComponents(app);

  setupI18n(app);

  setupAppVersionNotification();

  app.mount('#app');
}

setupApp();
