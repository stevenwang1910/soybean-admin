<template>
  <div class="workflow-index-container">
    <div class="container-header">
      <h2>工作流引擎集成展示</h2>
      <p>企业级工作流引擎的核心功能与集成效果展示</p>
    </div>
    
    <div class="container-content">
      <!-- 功能卡片 -->
      <div class="feature-cards">
        <n-card
          hoverable
          bordered
          @click="$router.push('/plugin/workflow/designer')"
          class="feature-card"
        >
          <template #header>
            <div class="card-header">
              <n-icon size="32"><md-design /></n-icon>
              <h3>流程设计器</h3>
            </div>
          </template>
          <div class="card-content">
            <p>可视化流程设计工具，支持拖拽式节点添加与连接，实现流程定义的快速构建。</p>
          </div>
          <template #footer>
            <div class="card-footer">
              <n-button type="primary" text>进入设计器</n-button>
            </div>
          </template>
        </n-card>
        
        <n-card
          hoverable
          bordered
          @click="$router.push('/plugin/workflow/instance')"
          class="feature-card"
        >
          <template #header>
            <div class="card-header">
              <n-icon size="32"><md-list /></n-icon>
              <h3>流程实例管理</h3>
            </div>
          </template>
          <div class="card-content">
            <p>管理所有流程实例，支持启动、暂停、恢复、终止等操作，实时监控流程运行状态。</p>
          </div>
          <template #footer>
            <div class="card-footer">
              <n-button type="primary" text>实例管理</n-button>
            </div>
          </template>
        </n-card>
        
        <n-card
          hoverable
          bordered
          disabled
          class="feature-card"
        >
          <template #header>
            <div class="card-header">
              <n-icon size="32"><md-analytics /></n-icon>
              <h3>流程监控</h3>
            </div>
          </template>
          <div class="card-content">
            <p>实时监控流程运行情况，查看流程实例的执行历史、节点状态和流转记录。</p>
          </div>
          <template #footer>
            <div class="card-footer">
              <n-button type="primary" text disabled>敬请期待</n-button>
            </div>
          </template>
        </n-card>
        
        <n-card
          hoverable
          bordered
          disabled
          class="feature-card"
        >
          <template #header>
            <div class="card-header">
              <n-icon size="32"><md-settings /></n-icon>
              <h3>流程配置</h3>
            </div>
          </template>
          <div class="card-content">
            <p>配置流程的各种参数和规则，包括节点属性、流转条件、权限控制等。</p>
          </div>
          <template #footer>
            <div class="card-footer">
              <n-button type="primary" text disabled>敬请期待</n-button>
            </div>
          </template>
        </n-card>
      </div>
      
      <!-- 功能介绍 -->
      <div class="feature-intro">
        <h3>核心功能特性</h3>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-drag /></n-icon>
            </div>
            <div class="feature-text">
              <h4>拖拽式设计</h4>
              <p>直观的拖拽式界面，轻松添加和连接流程节点，实现流程定义的快速构建。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-code /></n-icon>
            </div>
            <div class="feature-text">
              <h4>灵活的节点类型</h4>
              <p>支持多种节点类型，包括开始节点、任务节点、判断节点、结束节点等，满足不同业务场景需求。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-refresh /></n-icon>
            </div>
            <div class="feature-text">
              <h4>完整的生命周期管理</h4>
              <p>支持流程实例的启动、暂停、恢复、终止等操作，实现流程的全生命周期管理。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-time /></n-icon>
            </div>
            <div class="feature-text">
              <h4>详细的执行历史</h4>
              <p>记录流程实例的每一步执行情况，便于问题排查和流程审计。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-security /></n-icon>
            </div>
            <div class="feature-text">
              <h4>完善的权限控制</h4>
              <p>支持基于角色的权限控制，确保流程的安全性和可管理性。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <n-icon size="24"><md-extensions /></n-icon>
            </div>
            <div class="feature-text">
              <h4>可扩展的架构</h4>
              <p>采用插件化架构设计，支持未来功能的扩展和定制。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 工作流引擎主页面
</script>

<style scoped>
.workflow-index-container {
  padding: 20px;
  background-color: #F5F5F5;
  min-height: 100vh;
}

.container-header {
  text-align: center;
  margin-bottom: 40px;
}

.container-header h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.container-header p {
  font-size: 16px;
  color: #999;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.feature-card:disabled {
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.card-content {
  margin: 15px 0;
  font-size: 14px;
  color: #666;
}

.card-footer {
  text-align: right;
}

.feature-intro {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.feature-intro h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.feature-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.feature-icon {
  margin-top: 3px;
  color: #1890FF;
}

.feature-text h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
</style>