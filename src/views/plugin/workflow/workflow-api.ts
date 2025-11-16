// 工作流 API 接口定义

import { request } from '@/utils/service'

// 流程定义相关接口

// 创建流程定义
export const createProcessDefinition = (data: any) => {
  return request({
    url: '/api/workflow/process-definitions',
    method: 'post',
    data
  })
}

// 查询流程定义列表
export const getProcessDefinitionList = (params?: any) => {
  return request({
    url: '/api/workflow/process-definitions',
    method: 'get',
    params
  })
}

// 查询单个流程定义
export const getProcessDefinitionById = (id: string) => {
  return request({
    url: `/api/workflow/process-definitions/${id}`,
    method: 'get'
  })
}

// 更新流程定义
export const updateProcessDefinition = (id: string, data: any) => {
  return request({
    url: `/api/workflow/process-definitions/${id}`,
    method: 'put',
    data
  })
}

// 删除流程定义
export const deleteProcessDefinition = (id: string) => {
  return request({
    url: `/api/workflow/process-definitions/${id}`,
    method: 'delete'
  })
}

// 激活流程定义
export const activateProcessDefinition = (id: string) => {
  return request({
    url: `/api/workflow/process-definitions/${id}/activate`,
    method: 'put'
  })
}

// 暂停流程定义
export const suspendProcessDefinition = (id: string) => {
  return request({
    url: `/api/workflow/process-definitions/${id}/suspend`,
    method: 'put'
  })
}

// 流程实例相关接口

// 启动流程实例
export const startProcessInstance = (data: any) => {
  return request({
    url: '/api/workflow/process-instances',
    method: 'post',
    data
  })
}

// 查询流程实例列表
export const getProcessInstanceList = (params?: any) => {
  return request({
    url: '/api/workflow/process-instances',
    method: 'get',
    params
  })
}

// 查询单个流程实例
export const getProcessInstanceById = (id: string) => {
  return request({
    url: `/api/workflow/process-instances/${id}`,
    method: 'get'
  })
}

// 暂停流程实例
export const pauseProcessInstance = (id: string) => {
  return request({
    url: `/api/workflow/process-instances/${id}/pause`,
    method: 'put'
  })
}

// 恢复流程实例
export const resumeProcessInstance = (id: string) => {
  return request({
    url: `/api/workflow/process-instances/${id}/resume`,
    method: 'put'
  })
}

// 终止流程实例
export const terminateProcessInstance = (id: string) => {
  return request({
    url: `/api/workflow/process-instances/${id}/terminate`,
    method: 'put'
  })
}

// 执行流程节点
export const executeProcessNode = (instanceId: string, nodeId: string, data?: any) => {
  return request({
    url: `/api/workflow/process-instances/${instanceId}/nodes/${nodeId}/execute`,
    method: 'post',
    data
  })
}

// 获取流程实例执行历史
export const getProcessInstanceHistory = (id: string) => {
  return request({
    url: `/api/workflow/process-instances/${id}/history`,
    method: 'get'
  })
}

// 流程变量相关接口

// 设置流程变量
export const setProcessVariable = (instanceId: string, data: any) => {
  return request({
    url: `/api/workflow/process-instances/${instanceId}/variables`,
    method: 'post',
    data
  })
}

// 获取流程变量
export const getProcessVariables = (instanceId: string) => {
  return request({
    url: `/api/workflow/process-instances/${instanceId}/variables`,
    method: 'get'
  })
}

// 获取单个流程变量
export const getProcessVariable = (instanceId: string, variableName: string) => {
  return request({
    url: `/api/workflow/process-instances/${instanceId}/variables/${variableName}`,
    method: 'get'
  })
}

// 删除流程变量
export const deleteProcessVariable = (instanceId: string, variableName: string) => {
  return request({
    url: `/api/workflow/process-instances/${instanceId}/variables/${variableName}`,
    method: 'delete'
  })
}
