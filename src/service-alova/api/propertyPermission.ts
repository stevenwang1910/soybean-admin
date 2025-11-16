import { alova } from '../request';
import type { PageProperty } from '../mocks/property-permission';

// 获取所有属性配置
export const fetchAllPropertyPermissions = () => {
  return alova.Get('/api/property-permission/list');
};

// 获取特定页面的属性配置
export const fetchPagePropertyPermissions = (pageKey: string) => {
  return alova.Get(`/api/property-permission/page/${pageKey}`);
};

// 更新属性配置
export const updatePropertyPermission = (property: PageProperty) => {
  return alova.Post('/api/property-permission/update', property);
};

// 检查属性权限
export const checkPropertyPermission = (pageKey: string, propertyKey: string, role: string) => {
  return alova.Post('/api/property-permission/check', { pageKey, propertyKey, role });
};
