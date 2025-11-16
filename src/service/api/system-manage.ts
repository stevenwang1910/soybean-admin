import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/systemManage/getUserList',
    method: 'get',
    params
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}

/** import users */
export function fetchImportUsers(data: Api.SystemManage.User[]) {
  return request<{ success: number; failed: number }>({
    url: '/systemManage/importUsers',
    method: 'post',
    data
  });
}

/** get excel operation logs */
export function fetchExcelOperationLogs(params?: {
  page?: number;
  size?: number;
  type?: 'import' | 'export' | 'template';
  operator?: string;
  startTime?: string;
  endTime?: string;
}) {
  return request<{
    records: any[];
    total: number;
    pages: number;
    current: number;
    size: number;
  }>({
    url: '/systemManage/getExcelOperationLogs',
    method: 'get',
    params
  });
}
