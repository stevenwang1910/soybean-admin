<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/style/index.css';
import { Menu } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';

const canvasRef = ref<HTMLElement | null>(null);
let lf: LogicFlow | null = null;
const isFullscreen = ref(false);
const selectedNode = ref<any>(null);

// 节点类型
const nodeTypes = [
  { type: 'start', name: '开始节点', icon: '▶' },
  { type: 'task', name: '任务节点', icon: '📝' },
  { type: 'condition', name: '判断节点', icon: '❓' },
  { type: 'end', name: '结束节点', icon: '⏹️' }
];

// 初始化 LogicFlow
onMounted(() => {
  if (canvasRef.value) {
    lf = new LogicFlow({
      container: canvasRef.value,
      width: canvasRef.value.clientWidth,
      height: canvasRef.value.clientHeight,
      grid: {
        type: 'dot',
        size: 10
      },
      background: {
        color: '#F5F5F5'
      }
    });

    // 注册扩展
    lf.use(Menu);

    // 监听节点选择
    lf.on('node:click', event => {
      selectedNode.value = event.data.node;
    });

    // 监听画布点击（取消选择）
    lf.on('blank:click', () => {
      selectedNode.value = null;
    });

    // 渲染画布
    lf.render();
  }
});

onUnmounted(() => {
  if (lf) {
    lf.destroy();
  }
});

// 节点拖拽开始
const handleNodeDragStart = (event: MouseEvent, node: any) => {
  if (lf) {
    const data = {
      type: node.type,
      x: 0,
      y: 0
    };
    lf.dnd.startDrag(event, data);
  }
};

// 保存流程
const saveFlow = () => {
  if (lf) {
    const graphData = lf.getGraphData();
    console.log('保存流程:', graphData);
    // TODO: 调用后端接口保存流程定义
    alert('流程已保存！');
  }
};

// 导出流程
const exportFlow = () => {
  if (lf) {
    const graphData = lf.getGraphData();
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  }
};

// 清空画布
const clearFlow = () => {
  if (lf) {
    lf.clear();
    selectedNode.value = null;
    alert('画布已清空！');
  }
};

// 全屏切换
const toggleFullscreen = () => {
  const container = document.querySelector('.workflow-container') as HTMLElement;
  if (isFullscreen.value) {
    document.exitFullscreen();
    isFullscreen.value = false;
  } else {
    container.requestFullscreen();
    isFullscreen.value = true;
  }
};

// 撤销
const undo = () => {
  if (lf) {
    lf.undo();
  }
};

// 重做
const redo = () => {
  if (lf) {
    lf.redo();
  }
};

// 放大
const zoomIn = () => {
  if (lf) {
    lf.zoom(0.1);
  }
};

// 缩小
const zoomOut = () => {
  if (lf) {
    lf.zoom(-0.1);
  }
};

// 重置缩放
const resetZoom = () => {
  if (lf) {
    lf.zoomTo(1);
  }
};

// 自适应视图
const fitView = () => {
  if (lf) {
    lf.fitView();
  }
};
</script>

<template>
  <div class="workflow-container">
    <div class="workflow-header">
      <h1>工作流引擎</h1>
      <div class="header-actions">
        <NButton type="primary" @click="saveFlow">保存流程</NButton>
        <NButton @click="exportFlow">导出流程</NButton>
        <NButton @click="clearFlow">清空画布</NButton>
        <NButton @click="toggleFullscreen">{{ isFullscreen ? '退出全屏' : '全屏' }}</NButton>
      </div>
    </div>

    <div class="workflow-content">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <h3>流程节点</h3>
        <div class="node-list">
          <div
            v-for="node in nodeTypes"
            :key="node.type"
            class="node-item"
            @mousedown="handleNodeDragStart($event, node)"
          >
            <span class="node-icon">{{ node.icon }}</span>
            <span class="node-name">{{ node.name }}</span>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-container">
        <div ref="canvasRef" class="logicflow-canvas"></div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h3>属性编辑</h3>
        <div v-if="selectedNode" class="property-content">
          <NInput v-model:value="selectedNode.properties.name" placeholder="节点名称" :disabled="!selectedNode" />
          <NInput
            v-model:value="selectedNode.properties.description"
            placeholder="节点描述"
            type="textarea"
            rows="3"
            :disabled="!selectedNode"
          />
          <NSelect v-model:value="selectedNode.properties.type" placeholder="节点类型" :disabled="!selectedNode">
            <NOption label="开始节点" value="start" />
            <NOption label="任务节点" value="task" />
            <NOption label="判断节点" value="condition" />
            <NOption label="结束节点" value="end" />
          </NSelect>
        </div>
        <div v-else class="property-empty">
          <span>请选择一个节点进行编辑</span>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 -->
    <div class="workflow-toolbar">
      <NButton @click="undo">撤销</NButton>
      <NButton @click="redo">重做</NButton>
      <NButton @click="zoomIn">放大</NButton>
      <NButton @click="zoomOut">缩小</NButton>
      <NButton @click="resetZoom">重置缩放</NButton>
      <NButton @click="fitView">自适应视图</NButton>
    </div>
  </div>
</template>

<style scoped>
.workflow-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.workflow-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.workflow-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.node-panel {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 20px;
  overflow-y: auto;
}

.node-panel h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
}

.node-item:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.node-item:active {
  cursor: grabbing;
}

.node-icon {
  font-size: 20px;
  margin-right: 10px;
}

.node-name {
  font-size: 14px;
  color: #333;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.logicflow-canvas {
  width: 100%;
  height: 100%;
}

.property-panel {
  width: 280px;
  background-color: #fff;
  border-left: 1px solid #e8e8e8;
  padding: 20px;
  overflow-y: auto;
}

.property-panel h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.property-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.property-empty {
  text-align: center;
  color: #999;
  padding: 50px 0;
}

.workflow-toolbar {
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  overflow-x: auto;
}
</style>
