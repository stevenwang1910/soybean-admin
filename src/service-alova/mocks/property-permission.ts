import { createMock, defineMock } from '@sa/alova/adapter-mock';

// 页面属性配置数据模型
interface PageProperty {
  pageKey: string;
  propertyKey: string;
  propertyName: string;
  visibleRoles: string[];
  editable?: boolean;
}

// 初始属性配置数据
const initialPropertyPermissions: PageProperty[] = [
  {
    pageKey: 'home',
    propertyKey: 'turnover',
    propertyName: '成交额',
    visibleRoles: ['admin', 'manager'] // 仅管理员和管理层可见
  },
  {
    pageKey: 'home',
    propertyKey: 'transactionTotal',
    propertyName: '交易总额',
    visibleRoles: ['admin', 'manager'] // 仅管理员和管理层可见
  }
];

// 存储属性配置的Map
const propertyPermissionMap = new Map<string, PageProperty>();
initialPropertyPermissions.forEach(prop => {
  const key = `${prop.pageKey}:${prop.propertyKey}`;
  propertyPermissionMap.set(key, prop);
});

export default defineMock({
  // 获取所有属性配置
  '/api/property-permission/list': createMock.get((_params, _headers) => {
    return {
      success: true,
      data: Array.from(propertyPermissionMap.values()),
      message: '获取属性配置成功'
    };
  }),

  // 获取特定页面的属性配置
  '/api/property-permission/page/:pageKey': createMock.get((params) => {
    const { pageKey } = params;
    const pageProps = Array.from(propertyPermissionMap.values())
      .filter(prop => prop.pageKey === pageKey);
    return {
      success: true,
      data: pageProps,
      message: `获取${pageKey}页面属性配置成功`
    };
  }),

  // 更新属性配置
  '/api/property-permission/update': createMock.post((params) => {
    const { pageKey, propertyKey, visibleRoles } = params as PageProperty;
    const key = `${pageKey}:${propertyKey}`;
    const prop = propertyPermissionMap.get(key);
    if (prop) {
      prop.visibleRoles = visibleRoles;
      propertyPermissionMap.set(key, prop);
      return {
        success: true,
        data: prop,
        message: '更新属性配置成功'
      };
    }
    return {
      success: false,
      data: null,
      message: '属性配置不存在'
    };
  }),

  // 检查属性权限
  '/api/property-permission/check': createMock.post((params) => {
    const { pageKey, propertyKey, role } = params;
    const key = `${pageKey}:${propertyKey}`;
    const prop = propertyPermissionMap.get(key);
    if (prop) {
      const hasPermission = prop.visibleRoles.includes(role);
      return {
        success: true,
        data: hasPermission,
        message: hasPermission ? '有权限访问该属性' : '无权限访问该属性'
      };
    }
    return {
      success: false,
      data: false,
      message: '属性配置不存在'
    };
  })
});
