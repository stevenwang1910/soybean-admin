import { useAuthStore } from '@/store/modules/auth';

/**
 * 检查Excel导入/导出权限
 * @param action 需要检查的权限动作 (excel:import, excel:export, excel:template:generate)
 * @returns 是否拥有权限
 */
export function checkExcelPermission(action: string): boolean {
  const authStore = useAuthStore();
  const { userInfo, isStaticSuper } = authStore;
  
  // 超级管理员拥有所有权限
  if (isStaticSuper) {
    return true;
  }
  
  // 检查按钮权限
  const buttons = userInfo?.buttons || [];
  return buttons.includes(action);
}

/**
 * 检查是否有导入权限
 * @returns 是否拥有导入权限
 */
export function checkImportPermission(): boolean {
  return checkExcelPermission('excel:import');
}

/**
 * 检查是否有导出权限
 * @returns 是否拥有导出权限
 */
export function checkExportPermission(): boolean {
  return checkExcelPermission('excel:export');
}

/**
 * 检查是否有模板生成权限
 * @returns 是否拥有模板生成权限
 */
export function checkGenerateTemplatePermission(): boolean {
  return checkExcelPermission('excel:template:generate');
}