// 工作流引擎核心逻辑

// 流程定义接口
export interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  graphData: any;
  status: 'active' | 'inactive';
  createTime: Date;
  updateTime: Date;
}

// 流程实例接口
export interface ProcessInstance {
  id: string;
  definitionId: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'terminated';
  currentNode: string;
  variables: Record<string, any>;
  createTime: Date;
  startTime: Date | null;
  endTime: Date | null;
}

// 节点执行历史接口
export interface NodeExecutionHistory {
  id: string;
  instanceId: string;
  nodeId: string;
  nodeName: string;
  status: 'success' | 'failure' | 'running';
  startTime: Date;
  endTime: Date | null;
  variables: Record<string, any>;
  error: string | null;
}

// 工作流引擎类
export class WorkflowEngine {
  private processDefinitions: Map<string, ProcessDefinition> = new Map();
  private processInstances: Map<string, ProcessInstance> = new Map();
  private executionHistory: Map<string, NodeExecutionHistory[]> = new Map();
  private idCounter = 1;

  // 创建流程定义
  createProcessDefinition(
    name: string,
    description: string,
    graphData: any
  ): ProcessDefinition {
    const id = `process-def-${this.idCounter++}`;
    const now = new Date();
    const definition: ProcessDefinition = {
      id,
      name,
      description,
      graphData,
      status: 'active',
      createTime: now,
      updateTime: now
    };
    this.processDefinitions.set(id, definition);
    return definition;
  }

  // 查询流程定义
  getProcessDefinition(id: string): ProcessDefinition | undefined {
    return this.processDefinitions.get(id);
  }

  // 查询所有流程定义
  getAllProcessDefinitions(): ProcessDefinition[] {
    return Array.from(this.processDefinitions.values());
  }

  // 更新流程定义
  updateProcessDefinition(
    id: string,
    updates: Partial<ProcessDefinition>
  ): ProcessDefinition | undefined {
    const definition = this.processDefinitions.get(id);
    if (definition) {
      const updatedDefinition = {
        ...definition,
        ...updates,
        updateTime: new Date()
      };
      this.processDefinitions.set(id, updatedDefinition);
      return updatedDefinition;
    }
    return undefined;
  }

  // 删除流程定义
  deleteProcessDefinition(id: string): boolean {
    return this.processDefinitions.delete(id);
  }

  // 启动流程实例
  startProcessInstance(
    definitionId: string,
    variables: Record<string, any> = {}
  ): ProcessInstance | undefined {
    const definition = this.processDefinitions.get(definitionId);
    if (!definition || definition.status !== 'active') {
      return undefined;
    }

    const id = `process-inst-${this.idCounter++}`;
    const now = new Date();
    // 查找开始节点
    const startNode = definition.graphData.nodes.find((node: any) => node.type === 'start');
    const instance: ProcessInstance = {
      id,
      definitionId,
      name: `${definition.name}-${now.toISOString()}`,
      status: 'running',
      currentNode: startNode ? startNode.id : '',
      variables,
      createTime: now,
      startTime: now,
      endTime: null
    };
    this.processInstances.set(id, instance);
    return instance;
  }

  // 暂停流程实例
  pauseProcessInstance(id: string): ProcessInstance | undefined {
    const instance = this.processInstances.get(id);
    if (instance && instance.status === 'running') {
      instance.status = 'paused';
      return instance;
    }
    return undefined;
  }

  // 恢复流程实例
  resumeProcessInstance(id: string): ProcessInstance | undefined {
    const instance = this.processInstances.get(id);
    if (instance && instance.status === 'paused') {
      instance.status = 'running';
      return instance;
    }
    return undefined;
  }

  // 终止流程实例
  terminateProcessInstance(id: string): ProcessInstance | undefined {
    const instance = this.processInstances.get(id);
    if (instance && instance.status !== 'completed' && instance.status !== 'terminated') {
      instance.status = 'terminated';
      instance.endTime = new Date();
      return instance;
    }
    return undefined;
  }

  // 执行流程节点
  executeNode(
    instanceId: string,
    nodeId: string,
    variables: Record<string, any> = {}
  ): NodeExecutionHistory | undefined {
    const instance = this.processInstances.get(instanceId);
    if (!instance || instance.status !== 'running') {
      return undefined;
    }

    const definition = this.processDefinitions.get(instance.definitionId);
    if (!definition) {
      return undefined;
    }

    const node = definition.graphData.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      return undefined;
    }

    const historyId = `exec-hist-${this.idCounter++}`;
    const startTime = new Date();
    let status: 'success' | 'failure' = 'success';
    let error: string | null = null;

    try {
      // 执行节点逻辑
      this.executeNodeLogic(node, instance, variables);
      // 更新流程实例当前节点
      instance.currentNode = nodeId;
      // 更新变量
      instance.variables = { ...instance.variables, ...variables };
      // 检查是否为结束节点
      if (node.type === 'end') {
        instance.status = 'completed';
        instance.endTime = new Date();
      }
    } catch (e) {
      status = 'failure';
      error = e instanceof Error ? e.message : String(e);
    }

    const executionHistory: NodeExecutionHistory = {
      id: historyId,
      instanceId,
      nodeId,
      nodeName: node.properties?.name || nodeId,
      status,
      startTime,
      endTime: new Date(),
      variables,
      error
    };

    // 保存执行历史
    const histories = this.executionHistory.get(instanceId) || [];
    histories.push(executionHistory);
    this.executionHistory.set(instanceId, histories);

    return executionHistory;
  }

  // 执行节点逻辑
  private executeNodeLogic(
    node: any,
    instance: ProcessInstance,
    variables: Record<string, any>
  ) {
    // 根据节点类型执行不同逻辑
    switch (node.type) {
      case 'start':
        console.log('执行开始节点:', node.id);
        break;
      case 'task':
        console.log('执行任务节点:', node.id, '变量:', variables);
        break;
      case 'condition':
        console.log('执行判断节点:', node.id, '变量:', variables);
        break;
      case 'end':
        console.log('执行结束节点:', node.id);
        break;
      default:
        console.log('执行未知节点类型:', node.type);
        break;
    }
  }

  // 获取流程实例
  getProcessInstance(id: string): ProcessInstance | undefined {
    return this.processInstances.get(id);
  }

  // 获取所有流程实例
  getAllProcessInstances(): ProcessInstance[] {
    return Array.from(this.processInstances.values());
  }

  // 获取节点执行历史
  getNodeExecutionHistory(instanceId: string): NodeExecutionHistory[] | undefined {
    return this.executionHistory.get(instanceId);
  }

  // 获取流程实例执行历史
  getProcessExecutionHistory(instanceId: string): NodeExecutionHistory[] | undefined {
    return this.executionHistory.get(instanceId);
  }
}

// 创建工作流引擎实例
export const workflowEngine = new WorkflowEngine();
