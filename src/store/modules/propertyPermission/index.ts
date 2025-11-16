import { ref, reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from '@/enum';
import { fetchAllPropertyPermissions, fetchPagePropertyPermissions, updatePropertyPermission } from '@/service-alova/api/propertyPermission';
import type { PageProperty } from '@/service-alova/mocks/property-permission';

export const usePropertyPermissionStore = defineStore(SetupStoreId.PropertyPermission, () => {
  // 所有属性配置
  const allProperties = ref<PageProperty[]>([]);
  
  // 属性配置的Map结构，用于快速查询
  const propertyMap = reactive(new Map<string, PageProperty>());

  // 加载所有属性配置
  async function loadAllProperties() {
    const { data, error } = await fetchAllPropertyPermissions();
    if (!error && data) {
      allProperties.value = data;
      // 更新Map结构
      allProperties.value.forEach(prop => {
        const key = `${prop.pageKey}:${prop.propertyKey}`;
        propertyMap.set(key, prop);
      });
    }
  }

  // 加载特定页面的属性配置
  async function loadPageProperties(pageKey: string) {
    const { data, error } = await fetchPagePropertyPermissions(pageKey);
    if (!error && data) {
      // 更新页面相关的属性配置
      data.forEach(prop => {
        const key = `${prop.pageKey}:${prop.propertyKey}`;
        const existingIndex = allProperties.value.findIndex(p => `${p.pageKey}:${p.propertyKey}` === key);
        if (existingIndex !== -1) {
          allProperties.value[existingIndex] = prop;
        } else {
          allProperties.value.push(prop);
        }
        propertyMap.set(key, prop);
      });
    }
  }

  // 更新属性配置
  async function updateProperty(prop: PageProperty) {
    const { data, error } = await updatePropertyPermission(prop);
    if (!error && data) {
      const key = `${data.pageKey}:${data.propertyKey}`;
      const existingIndex = allProperties.value.findIndex(p => `${p.pageKey}:${p.propertyKey}` === key);
      if (existingIndex !== -1) {
        allProperties.value[existingIndex] = data;
      } else {
        allProperties.value.push(data);
      }
      propertyMap.set(key, data);
      return true;
    }
    return false;
  }

  // 检查用户是否有属性权限
  function hasPropertyPermission(pageKey: string, propertyKey: string, roles: string[]): boolean {
    const key = `${pageKey}:${propertyKey}`;
    const prop = propertyMap.get(key);
    if (!prop) {
      // 如果属性配置不存在，默认允许访问
      return true;
    }
    // 检查用户角色是否在可见角色列表中
    return roles.some(role => prop.visibleRoles.includes(role));
  }

  // 获取特定页面的属性配置
  function getPageProperties(pageKey: string): PageProperty[] {
    return allProperties.value.filter(prop => prop.pageKey === pageKey);
  }

  // 获取特定属性配置
  function getProperty(pageKey: string, propertyKey: string): PageProperty | undefined {
    const key = `${pageKey}:${propertyKey}`;
    return propertyMap.get(key);
  }

  return {
    allProperties,
    propertyMap,
    loadAllProperties,
    loadPageProperties,
    updateProperty,
    hasPropertyPermission,
    getPageProperties,
    getProperty
  };
});
