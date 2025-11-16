<template>
  <div class="instance-manager-container">
    <div class="container-header">
      <h2>流程实例管理</h2>
      <n-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <n-icon><md-add-circle-outline /></n-icon>
        </template>
        启动流程
      </n-button>
    </div>
    
    <div class="container-content">
      <!-- 搜索筛选 -->
      <div class="search-bar">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索流程实例名称"
          :prefix="() => <n-icon><md-search /></n-icon>"
          style="width: 250px; margin-right: 20px;"
        />
        <n-select
          v-model:value="statusFilter"
          placeholder="筛选状态"
          style="width: 150px; margin-right: 20px;"
        >
          <n-option label="全部" value="" />
          <n-option label="运行中" value="running" />
          <n-option label="已暂停" value="paused" />
          <n-option label="已完成" value="completed" />
          <n-option label="已终止" value="terminated" />
        </n-select>
        <n-button type="primary" @click="handleSearch">
          <template #icon>
            <n-icon><md-search /></n-icon>
          </template>
          搜索
        </n-button>
        <n-button @click="handleReset">
          <template #icon>
            <n-icon><md-refresh /></n-icon>
          </template>
          重置
        </n-button>
      </div>
      
      <!-- 流程实例列表 -->
      <n-data-table
        :columns="columns"
        :data="processInstances"
        :pagination="{
          pageSize: 10,
          showSizePicker: true,
          pageSizes: [10, 20, 50, 100],
          showQuickJumper: true
        }"
        :row-key="row => row.id"
        bordered
      >
        <template #status="{ row }">
          <n-tag
            :type="getStatusTagType(row.status)"
            size="small"
          >
            {{ getStatusText(row.status) }}
          </n-tag>
        </template>
        
        <template #action="{ row }">
          <div class="action-buttons">
            <n-button
              text
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              <template #icon>
                <n-icon><md-eye /></n-icon>
              </template>
              查看
            </n-button>
            <n-button
              text
              type="info"
              size="small"
              @click="handleExecute(row)"
              :disabled="row.status !== 'running'"
            >
              <template #icon>
                <n-icon><md-play-arrow /></n-icon>
              </template>
              执行
            </n-button>
            <n-button
              text
              type="warning"
              size="small"
              @click="handlePause(row)"
              :disabled="row.status !== 'running'"
            >
              <template #icon>
                <n-icon><md-pause /></n-icon>
              </template>
              暂停
            </n-button>
            <n-button
              text
              type="success"
              size="small"
              @click="handleResume(row)"
              :disabled="row.status !== 'paused'"
            >
              <template #icon>
                <n-icon><md-play-arrow /></n-icon>
              </template>
              恢复
            </n-button>
            <n-button
              text
              type="error"
              size="small"
              @click="handleTerminate(row)"
              :disabled="row.status === 'completed' || row.status === 'terminated'"
            >
              <template #icon>
                <n-icon><md-stop /></n-icon>
              </template>
              终止
            </n-button>
            <n-button
              text
              type="info"
              size="small"
              @click="handleHistory(row)"
            >
              <template #icon>
                <n-icon><md-time /></n-icon>
              </template>
              历史
            </n-button>
          </div>
        </template>
      </n-data-table>
    </div>
    
    <!-- 启动流程弹窗 -->
    <n-modal
      v-model:show="showCreateModal"
      title="启动流程"
      preset="dialog"
      :style="{ width: '500px' }"
      @positive-click="handleStartProcess"
    >
      <div class="form-container">
        <div class="form-item">
          <n-select
            v-model:value="selectedDefinitionId"
            placeholder="选择流程定义"
            style="width: 100%;"
          >
            <n-option
              v-for="definition in processDefinitions"
              :key="definition.id"
              :label="definition.name"
              :value="definition.id"
            />
          </n-select>
        </div>
        <div class="form-item">
          <n-input
            v-model:value="instanceName"
            placeholder="流程实例名称"
            style="width: 100%;"
          />
        </div>
        <div class="form-item">
          <n-input
            v-model:value="instanceVariables"
            placeholder="流程变量（JSON格式）"
            type="textarea"
            rows="4"
            style="width: 100%;"
          />
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { workflowEngine } from './workflow-engine'
import type { ProcessInstance, ProcessDefinition } from './workflow-engine'

const showCreateModal = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('')
const selectedDefinitionId = ref('')
const instanceName = ref('')
const instanceVariables = ref('{ "key": "value" }')

// 模拟数据
const processDefinitions = ref<ProcessDefinition[]>([])
const processInstances = ref<ProcessInstance[]>([])

// 表格列配置
const columns = [
  { title: '实例ID', key: 'id', ellipsis: true, width: 200 },
  { title: '实例名称', key: 'name', ellipsis: true, width: 200 },
  { title: '流程定义', key: 'definitionId', ellipsis: true, width: 200 },
  { title: '当前节点', key: 'currentNode', ellipsis: true, width: 150 },
  { title: '状态', key: 'status', width: 100, render: 'status' },
  { title: '创建时间', key: 'createTime', width: 180 },
  { title: '开始时间', key: 'startTime', width: 180 },
  { title: '结束时间', key: 'endTime', width: 180 },
  { title: '操作', key: 'action', width: 300, render: 'action' }
]

// 获取流程定义列表
const fetchProcessDefinitions = () => {
  processDefinitions.value = workflowEngine.getAllProcessDefinitions()
}

// 获取流程实例列表
const fetchProcessInstances = () => {
  processInstances.value = workflowEngine.getAllProcessInstances()
    .map(instance => ({
      ...instance,
      createTime: instance.createTime.toLocaleString(),
      startTime: instance.startTime?.toLocaleString() || '',
      endTime: instance.endTime?.toLocaleString() || ''
    }))
}

// 搜索
const handleSearch = () => {
  let instances = workflowEngine.getAllProcessInstances()
  
  // 关键词过滤
  if (searchKeyword.value) {
    instances = instances.filter(instance => 
      instance.name.includes(searchKeyword.value)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    instances = instances.filter(instance => 
      instance.status === statusFilter.value
    )
  }
  
  processInstances.value = instances.map(instance => ({
      ...instance,
      createTime: instance.createTime.toLocaleString(),
      startTime: instance.startTime?.toLocaleString() || '',
      endTime: instance.endTime?.toLocaleString() || ''
    }))
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  statusFilter.value = ''
  fetchProcessInstances()
}

// 启动流程
const handleStartProcess = () => {
  if (!selectedDefinitionId.value) {
    alert('请选择流程定义')
    return
  }
  
  try {
    const variables = JSON.parse(instanceVariables.value)
    const instance = workflowEngine.startProcessInstance(
      selectedDefinitionId.value,
      variables
    )
    
    if (instance) {
      alert('流程实例已启动！')
      showCreateModal.value = false
      fetchProcessInstances()
      // 重置表单
      selectedDefinitionId.value = ''
      instanceName.value = ''
      instanceVariables.value = '{ "key": "value" }'
    } else {
      alert('流程启动失败！')
    }
  } catch (e) {
    alert('流程变量格式错误！')
  }
}

// 查看流程实例
const handleView = (row: any) => {
  console.log('查看流程实例:', row)
}

// 执行流程节点
const handleExecute = (row: any) => {
  const instance = workflowEngine.getProcessInstance(row.id)
  if (instance) {
    const history = workflowEngine.executeNode(row.id, instance.currentNode)
    if (history) {
      alert('节点执行成功！')
      fetchProcessInstances()
    } else {
      alert('节点执行失败！')
    }
  }
}

// 暂停流程实例
const handlePause = (row: any) => {
  const instance = workflowEngine.pauseProcessInstance(row.id)
  if (instance) {
    alert('流程已暂停！')
    fetchProcessInstances()
  } else {
    alert('流程暂停失败！')
  }
}

// 恢复流程实例
const handleResume = (row: any) => {
  const instance = workflowEngine.resumeProcessInstance(row.id)
  if (instance) {
    alert('流程已恢复！')
    fetchProcessInstances()
  } else {
    alert('流程恢复失败！')
  }
}

// 终止流程实例
const handleTerminate = (row: any) => {
  const instance = workflowEngine.terminateProcessInstance(row.id)
  if (instance) {
    alert('流程已终止！')
    fetchProcessInstances()
  } else {
    alert('流程终止失败！')
  }
}

// 查看执行历史
const handleHistory = (row: any) => {
  const history = workflowEngine.getNodeExecutionHistory(row.id)
  if (history) {
    console.log('执行历史:', history)
    alert('执行历史已输出到控制台！')
  } else {
    alert('无执行历史！')
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    running: '运行中',
    paused: '已暂停',
    completed: '已完成',
    terminated: '已终止'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'success' | 'warning' | 'error' | 'info' | undefined> = {
    running: 'success',
    paused: 'warning',
    completed: 'info',
    terminated: 'error'
  }
  return typeMap[status] || undefined
}

// 初始化数据
onMounted(() => {
  // 创建一些模拟流程定义
  workflowEngine.createProcessDefinition(
    '请假流程',
    '员工请假审批流程',
    { nodes: [], edges: [] }
  )
  workflowEngine.createProcessDefinition(
    '报销流程',
    '费用报销审批流程',
    { nodes: [], edges: [] }
  )
  
  fetchProcessDefinitions()
  fetchProcessInstances()
})
</script>

<style scoped>
.instance-manager-container {
  padding: 20px;
  background-color: #F5F5F5;
  min-height: 100vh;
}

.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>