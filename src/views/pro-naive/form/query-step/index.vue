<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { createProForm, ProInput, ProSelect, ProDate } from 'pro-naive-ui';
import { $t } from '@/locales';
import ConfigProvider from '../../ConfigProvider.vue';

// 定义表单数据类型
interface QueryFormData {
  // 步骤1：基本信息
  appName: string;
  appStatus: string;
  // 步骤2：时间范围
  createTimeStart: number;
  createTimeEnd: number;
  // 步骤3：用户信息
  userName: string;
  userRole: string;
  // 步骤4：项目信息
  projectName: string;
  projectStatus: string;
  // 步骤5：高级筛选
  keyword: string;
  priority: string;
}

// 当前步骤
const currentStep = ref(1);
// 总步骤数
const totalSteps = 5;
// 加载状态
const loading = ref(false);
// 消息提示
const message = useMessage();

// 创建表单实例
const form = createProForm<QueryFormData>({
  onSubmit: async (values) => {
    loading.value = true;
    try {
      // 模拟API请求
      await delay(1500);
      message.success('查询提交成功：' + JSON.stringify(values));
      // 这里可以将表单数据传递给列表页面进行查询
      console.log('查询条件：', values);
    } catch (error) {
      message.error('查询提交失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  }
});

// 验证当前步骤并前进
const handleNextStep = async () => {
  try {
    // 验证当前步骤的表单字段
    let pathsToValidate: string[] = [];
    switch (currentStep.value) {
      case 1:
        pathsToValidate = ['appName', 'appStatus'];
        break;
      case 2:
        pathsToValidate = ['createTimeStart', 'createTimeEnd'];
        break;
      case 3:
        pathsToValidate = ['userName', 'userRole'];
        break;
      case 4:
        pathsToValidate = ['projectName', 'projectStatus'];
        break;
      case 5:
        pathsToValidate = ['keyword', 'priority'];
        break;
    }
    await form.validate(pathsToValidate);
    // 前进到下一步
    currentStep.value++;
  } catch (error) {
    message.error('表单验证失败，请检查输入');
  }
};

// 后退到上一步
const handlePrevStep = () => {
  currentStep.value--;
};

// 延迟函数
function delay(time: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time);
  });
}
</script>

<template>
  <ConfigProvider>
    <div class="bg-#fff">
      <ProCard :title="'查询多步骤表单'" :show-collapse="false">
        <!-- 步骤导航 -->
        <NSteps :current="currentStep - 1" class="mb-24px">
          <NStep title="基本信息" description="填写应用基本信息" />
          <NStep title="时间范围" description="选择创建时间范围" />
          <NStep title="用户信息" description="填写用户相关信息" />
          <NStep title="项目信息" description="填写项目相关信息" />
          <NStep title="高级筛选" description="设置高级筛选条件" />
        </NSteps>

        <!-- 表单内容 -->
        <ProForm :form="form" :loading="loading" label-placement="left">
          <!-- 步骤1：基本信息 -->
          <template v-if="currentStep === 1">
            <ProInput
              title="应用名称"
              path="appName"
              required
              placeholder="请输入应用名称"
            />
            <ProSelect
              title="应用状态"
              path="appStatus"
              :field-props="{
                options: [
                  { label: '全部', value: '' },
                  { label: '活跃', value: 'active' },
                  { label: ' inactive', value: 'inactive' },
                  { label: '已删除', value: 'deleted' }
                ]
              }"
              placeholder="请选择应用状态"
            />
          </template>

          <!-- 步骤2：时间范围 -->
          <template v-if="currentStep === 2">
            <ProDate
              title="创建时间开始"
              path="createTimeStart"
              placeholder="请选择创建时间开始"
            />
            <ProDate
              title="创建时间结束"
              path="createTimeEnd"
              placeholder="请选择创建时间结束"
            />
          </template>

          <!-- 步骤3：用户信息 -->
          <template v-if="currentStep === 3">
            <ProInput
              title="用户名"
              path="userName"
              placeholder="请输入用户名"
            />
            <ProSelect
              title="用户角色"
              path="userRole"
              :field-props="{
                options: [
                  { label: '全部', value: '' },
                  { label: '管理员', value: 'admin' },
                  { label: '普通用户', value: 'user' },
                  { label: '访客', value: 'guest' }
                ]
              }"
              placeholder="请选择用户角色"
            />
          </template>

          <!-- 步骤4：项目信息 -->
          <template v-if="currentStep === 4">
            <ProInput
              title="项目名称"
              path="projectName"
              placeholder="请输入项目名称"
            />
            <ProSelect
              title="项目状态"
              path="projectStatus"
              :field-props="{
                options: [
                  { label: '全部', value: '' },
                  { label: '待处理', value: 'pending' },
                  { label: '运行中', value: 'running' },
                  { label: '已完成', value: 'completed' },
                  { label: '失败', value: 'failed' }
                ]
              }"
              placeholder="请选择项目状态"
            />
          </template>

          <!-- 步骤5：高级筛选 -->
          <template v-if="currentStep === 5">
            <ProInput
              title="关键词"
              path="keyword"
              placeholder="请输入关键词"
            />
            <ProSelect
              title="优先级"
              path="priority"
              :field-props="{
                options: [
                  { label: '全部', value: '' },
                  { label: '高', value: 'high' },
                  { label: '中', value: 'medium' },
                  { label: '低', value: 'low' }
                ]
              }"
              placeholder="请选择优先级"
            />
          </template>

          <!-- 导航按钮 -->
          <NFlex justify="space-between" class="mt-24px">
            <NButton
              :disabled="currentStep === 1 || loading"
              @click="handlePrevStep"
            >
              上一步
            </NButton>
            <NButtonGroup>
              <NButton
                v-if="currentStep < totalSteps"
                type="primary"
                :loading="loading"
                @click="handleNextStep"
              >
                下一步
              </NButton>
              <NButton
                v-else
                type="primary"
                attr-type="submit"
                :loading="loading"
              >
                提交查询
              </NButton>
            </NButtonGroup>
          </NFlex>
        </ProForm>
      </ProCard>
    </div>
  </ConfigProvider>
</template>