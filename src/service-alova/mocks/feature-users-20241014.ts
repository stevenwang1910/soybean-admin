import { defineMock } from '@sa/alova/mock';

// you can separate the mock data into multiple files dependent on your project versions
export default defineMock({
  '[POST]/systemManage/addUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '[POST]/systemManage/updateUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '[DELETE]/systemManage/deleteUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '[DELETE]/systemManage/batchDeleteUser': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '[POST]/auth/sendCaptcha': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '[POST]/auth/verifyCaptcha': () => {
    return {
      code: '0000',
      msg: 'success',
      data: null
    };
  },
  '/mock/getLastTime': () => {
    return {
      code: '0000',
      msg: 'success',
      data: {
        time: new Date().toLocaleTimeString()
      }
    };
  },
  '[POST]/auth/check-property-permission': (params) => {
    const { pageKey, propertyKey } = params;
    // 模拟属性权限检查逻辑，这里简化处理
    // 仅管理员和管理层可以访问成交额和交易总额
    const restrictedProperties = ['turnover', 'transactionTotal'];
    const restrictedRoles = ['admin', 'manager'];
    
    // 获取当前用户角色（模拟）
    const currentRole = 'user'; // 默认普通用户
    
    // 检查权限
    const hasPermission = !(restrictedProperties.includes(propertyKey) && !restrictedRoles.includes(currentRole));
    
    return {
      code: '0000',
      msg: hasPermission ? '有权限访问该属性' : '无权限访问该属性',
      data: hasPermission
    };
  }
});
