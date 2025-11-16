import type { MaybeRef } from 'vue';
import { toValue } from 'vue';
import { usePropertyPermissionStore } from '@/store/modules/propertyPermission';
import { useAuthStore } from '@/store/modules/auth';
import { fetchCheckPropertyPermission } from '@/service-alova/api/auth';

export function usePropertyPermission() {
  const propertyPermissionStore = usePropertyPermissionStore();
  const authStore = useAuthStore();

  /**
   * 检查当前用户是否有访问特定页面属性的权限
   * @param pageKey 页面标识
   * @param propertyKey 属性标识
   * @returns boolean 是否有权限
   */
  const hasPermission = async (pageKey: MaybeRef<string>, propertyKey: MaybeRef<string>): Promise<boolean> => {
    const resolvedPageKey = toValue(pageKey);
    const resolvedPropertyKey = toValue(propertyKey);
    const userRoles = authStore.userInfo.roles;

    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // 前端权限检查
    const property = propertyPermissionStore.getProperty(resolvedPageKey, resolvedPropertyKey);
    if (!property) {
      return true; // 默认允许访问所有属性
    }

    const hasFrontendPermission = property.visibleRoles?.some(role => userRoles.includes(role)) ?? true;
    if (!hasFrontendPermission) {
      return false;
    }

    // 后端权限检查（双重校验）
    try {
      const response = await fetchCheckPropertyPermission(resolvedPageKey, resolvedPropertyKey);
      return response.data;
    } catch (error) {
      console.error('后端权限检查失败:', error);
      // 后端检查失败时，返回前端检查结果
      return hasFrontendPermission;
    }
  };

  /**
   * 获取特定页面的所有属性配置
   * @param pageKey 页面标识
   * @returns PageProperty[] 属性配置列表
   */
  const getPageProperties = (pageKey: string) => {
    return propertyPermissionStore.getPageProperties(pageKey);
  };

  /**
   * 获取特定属性配置
   * @param pageKey 页面标识
   * @param propertyKey 属性标识
   * @returns PageProperty | undefined 属性配置
   */
  const getProperty = (pageKey: string, propertyKey: string) => {
    return propertyPermissionStore.getProperty(pageKey, propertyKey);
  };

  return {
    hasPermission,
    getPageProperties,
    getProperty
  };
}
