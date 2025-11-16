import type { App } from 'vue';
import { createPinia } from 'pinia';
import { resetSetupStore } from './plugins';
// 导入属性权限store
import './modules/propertyPermission';

/** Setup Vue store plugin pinia */
export function setupStore(app: App) {
  const store = createPinia();

  store.use(resetSetupStore);

  app.use(store);
}
