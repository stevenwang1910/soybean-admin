<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage, NTag } from 'naive-ui';
import type { ProSearchFormColumns, ProDataTableColumns } from 'pro-naive-ui';
import {
  createProSearchForm,
  createProForm,
  renderProCopyableText,
  renderProDateText,
  renderProImages,
  renderProTags,
  useNDataTable
} from 'pro-naive-ui';
import { $t } from '@/locales';
import dayjs from 'dayjs';

// 日期格式化函数
function formatDate(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD');
}

// 日期时间格式化函数
function formatDateTime(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}
import ConfigProvider from '../../ConfigProvider.vue';

// 定义表单数据类型
interface QueryFormData {
  // 步骤1：基本信息
  appName: string;
  appStatus: string;
  // 步骤2：时间范围
  createTime: number;
  responseDate: number;
  endTime: number;
  // 步骤3：用户信息
  userName: string;
  userEmail: string;
  userPhone: string;
  // 步骤4：高级选项
  priority: string;
  category: string;
  tags: string[];
  // 步骤5：确认信息
  notes: string;
}

// 定义列表数据类型
interface ListItem {
  id: string;
  appName: string;
  appStatus: string;
  createTime: number;
  responseDate: number;
  endTime: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  priority: string;
  category: string;
  tags: string[];
  notes: string;
  now: number;
  src: any;
}

// 步骤状态
const currentStep = ref(1);
const totalSteps = 5;
const submiting = ref(false);
const message = useMessage();

// 创建表单实例
const form = createProForm<Partial<QueryFormData>>();

// 模拟列表数据获取
function fetchList(params: any, values: Partial<QueryFormData>) {
  console.log('查询参数:', params, '表单数据:', values);
  return new Promise<{ total: number; list: ListItem[] }>(resolve => {
    setTimeout(() => {
      // 模拟根据表单数据筛选列表
      const mockList: ListItem[] = [
        {
          id: '1',
          appName: values.appName || 'Wonderwall',
          appStatus: values.appStatus || 'active',
          createTime: values.createTime || Date.now(),
          responseDate: values.responseDate || Date.now(),
          endTime: values.endTime || Date.now(),
          userName: values.userName || 'John Doe',
          userEmail: values.userEmail || 'john@example.com',
          userPhone: values.userPhone || '123-456-7890',
          priority: values.priority || 'high',
          category: values.category || 'music',
          tags: values.tags || ['rock', 'britpop'],
          notes: values.notes || 'Sample note',
          now: Date.now(),
          src: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
        },
        {
          id: '2',
          appName: values.appName || "Don't Look Back in Anger",
          appStatus: values.appStatus || 'inactive',
          createTime: values.createTime || Date.now() - 86400000,
          responseDate: values.responseDate || Date.now() - 86400000,
          endTime: values.endTime || Date.now() + 86400000,
          userName: values.userName || 'Jane Smith',
          userEmail: values.userEmail || 'jane@example.com',
          userPhone: values.userPhone || '987-654-3210',
          priority: values.priority || 'medium',
          category: values.category || 'music',
          tags: values.tags || ['rock', 'britpop'],
          notes: values.notes || 'Another note',
          now: Date.now(),
          src: ''
        }
      ];

      resolve({
        total: 2,
        list: mockList
      });
    }, 1500);
  });
}

// 步骤配置
const steps = computed(() => [
  {
    title: $t('page.proNaive.form.queryStep.step1.title'),
    description: $t('page.proNaive.form.queryStep.step1.description')
  },
  {
    title: $t('page.proNaive.form.queryStep.step2.title'),
    description: $t('page.proNaive.form.queryStep.step2.description')
  },
  {
    title: $t('page.proNaive.form.queryStep.step3.title'),
    description: $t('page.proNaive.form.queryStep.step3.description')
  },
  {
    title: $t('page.proNaive.form.queryStep.step4.title'),
    description: $t('page.proNaive.form.queryStep.step4.description')
  },
  {
    title: $t('page.proNaive.form.queryStep.step5.title'),
    description: $t('page.proNaive.form.queryStep.step5.description')
  }
]);

// 步骤1表单列配置
const step1Columns = computed<ProSearchFormColumns<QueryFormData>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.step1.appName'),
    path: 'appName',
    rules: [
      { required: true, message: $t('page.proNaive.form.queryStep.step1.appNameRequired'), trigger: 'blur' }
    ]
  },
  {
    title: $t('page.proNaive.form.queryStep.step1.appStatus'),
    path: 'appStatus',
    field: 'select',
    options: [
      { label: $t('page.proNaive.form.queryStep.status.active'), value: 'active' },
      { label: $t('page.proNaive.form.queryStep.status.inactive'), value: 'inactive' },
      { label: $t('page.proNaive.form.queryStep.status.pending'), value: 'pending' }
    ],
    rules: [
      { required: true, message: $t('page.proNaive.form.queryStep.step1.appStatusRequired'), trigger: 'change' }
    ]
  }
]);

// 步骤2表单列配置
const step2Columns = computed<ProSearchFormColumns<QueryFormData>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.step2.createTime'),
    path: 'createTime',
    field: 'date'
  },
  {
    title: $t('page.proNaive.form.queryStep.step2.responseDate'),
    path: 'responseDate',
    field: 'date-time'
  },
  {
    title: $t('page.proNaive.form.queryStep.step2.endTime'),
    path: 'endTime',
    field: 'date'
  }
]);

// 步骤3表单列配置
const step3Columns = computed<ProSearchFormColumns<QueryFormData>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.step3.userName'),
    path: 'userName',
    rules: [
      { required: true, message: $t('page.proNaive.form.queryStep.step3.userNameRequired'), trigger: 'blur' }
    ]
  },
  {
    title: $t('page.proNaive.form.queryStep.step3.userEmail'),
    path: 'userEmail',
    rules: [
      { required: true, message: $t('page.proNaive.form.queryStep.step3.userEmailRequired'), trigger: 'blur' },
      { type: 'email', message: $t('page.proNaive.form.queryStep.step3.userEmailInvalid'), trigger: 'blur' }
    ]
  },
  {
    title: $t('page.proNaive.form.queryStep.step3.userPhone'),
    path: 'userPhone',
    rules: [
      { required: true, message: $t('page.proNaive.form.queryStep.step3.userPhoneRequired'), trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: $t('page.proNaive.form.queryStep.step3.userPhoneInvalid'), trigger: 'blur' }
    ]
  }
]);

// 步骤4表单列配置
const step4Columns = computed<ProSearchFormColumns<QueryFormData>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.step4.priority'),
    path: 'priority',
    field: 'radio',
    options: [
      { label: $t('page.proNaive.form.queryStep.priority.high'), value: 'high' },
      { label: $t('page.proNaive.form.queryStep.priority.medium'), value: 'medium' },
      { label: $t('page.proNaive.form.queryStep.priority.low'), value: 'low' }
    ]
  },
  {
    title: $t('page.proNaive.form.queryStep.step4.category'),
    path: 'category',
    field: 'select',
    options: [
      { label: $t('page.proNaive.form.queryStep.category.music'), value: 'music' },
      { label: $t('page.proNaive.form.queryStep.category.video'), value: 'video' },
      { label: $t('page.proNaive.form.queryStep.category.image'), value: 'image' },
      { label: $t('page.proNaive.form.queryStep.category.document'), value: 'document' }
    ]
  },
  {
    title: $t('page.proNaive.form.queryStep.step4.tags'),
    path: 'tags',
    field: 'select',
    multiple: true,
    options: [
      { label: $t('page.proNaive.form.queryStep.tags.rock'), value: 'rock' },
      { label: $t('page.proNaive.form.queryStep.tags.pop'), value: 'pop' },
      { label: $t('page.proNaive.form.queryStep.tags.jazz'), value: 'jazz' },
      { label: $t('page.proNaive.form.queryStep.tags.classical'), value: 'classical' }
    ]
  }
]);

// 步骤5确认信息列配置
const step5Columns = computed<ProSearchFormColumns<QueryFormData>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.step5.notes'),
    path: 'notes',
    field: 'textarea',
    rows: 3
  }
]);

// 列表表格列配置
const tableColumns = computed<ProDataTableColumns<ListItem>>(() => [
  {
    title: $t('page.proNaive.form.queryStep.table.id'),
    path: 'id'
  },
  {
    title: $t('page.proNaive.form.queryStep.table.appName'),
    render: row => renderProCopyableText(row.appName)
  },
  {
    title: $t('page.proNaive.form.queryStep.table.appStatus'),
    render: row => renderProTags(row.appStatus)
  },
  {
    title: $t('page.proNaive.form.queryStep.table.createTime'),
    render: row => renderProDateText(row.createTime)
  },
  {
    title: $t('page.proNaive.form.queryStep.table.userName'),
    path: 'userName'
  },
  {
    title: $t('page.proNaive.form.queryStep.table.priority'),
    path: 'priority'
  },
  {
    title: $t('page.proNaive.form.queryStep.table.category'),
    path: 'category'
  },
  {
    title: $t('page.proNaive.form.queryStep.table.tags'),
    render: row => renderProTags(row.tags)
  },
  {
    title: $t('page.proNaive.form.queryStep.table.image'),
    width: 100,
    render: row => renderProImages(row.src)
  }
]);

// 初始化表格和搜索表单
const {
  table: { tableProps },
  search: { proSearchFormProps },
  refresh
} = useNDataTable(
  ({ current, pageSize, filters, sorter }, values) => fetchList({ current, pageSize, filters, sorter }, values),
  {
    form: form
  }
);

// 验证当前步骤并跳转到下一步
function toNextStep() {
  form.validate()?.then(() => {
    if (currentStep.value < totalSteps) {
      currentStep.value += 1;
    }
  }).catch(error => {
    message.error($t('page.proNaive.form.queryStep.validationError'));
    console.error('表单验证失败:', error);
  });
}

// 跳转到上一步
function toPrevStep() {
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
}

// 提交表单并查询列表
async function submitForm() {
  try {
    submiting.value = true;
    message.loading($t('page.proNaive.form.queryStep.submitting'), { duration: 1500 });
    
    // 验证所有步骤的表单数据
    await form.validate();
    
    // 刷新列表数据
    await refresh();
    
    message.success($t('page.proNaive.form.queryStep.submitSuccess'));
    
    // 重置步骤到第一步
    currentStep.value = 1;
  } catch (error) {
    message.error($t('page.proNaive.form.queryStep.submitError'));
    console.error('表单提交失败:', error);
  } finally {
    submiting.value = false;
  }
}

// 重置表单
function resetForm() {
  form.reset();
  currentStep.value = 1;
  message.success($t('page.proNaive.form.queryStep.resetSuccess'));
}
</script>

<template>
  <ConfigProvider>
    <div class="h-full flex flex-col">
      <!-- 步骤导航 -->
      <ProCard :title="$t('page.proNaive.form.queryStep.title')" class="mb-24px" :show-collapse="false">
        <div class="flex flex-col items-center">
          <NSteps :current="currentStep - 1" class="mb-32px w-full max-w-4xl">
            <NStep
              v-for="(step, index) in steps"
              :key="index"
              :title="step.title"
              :description="step.description"
            />
          </NSteps>
          
          <!-- 步骤内容 -->
          <div class="w-full max-w-4xl">
            <!-- 步骤1：基本信息 -->
            <div v-if="currentStep === 1">
              <ProSearchForm
                :form="form"
                :columns="step1Columns"
                label-placement="left"
                :show-submit-button="false"
                :show-reset-button="false"
              />
            </div>
            
            <!-- 步骤2：时间范围 -->
            <div v-if="currentStep === 2">
              <ProSearchForm
                :form="form"
                :columns="step2Columns"
                label-placement="left"
                :show-submit-button="false"
                :show-reset-button="false"
              />
            </div>
            
            <!-- 步骤3：用户信息 -->
            <div v-if="currentStep === 3">
              <ProSearchForm
                :form="form"
                :columns="step3Columns"
                label-placement="left"
                :show-submit-button="false"
                :show-reset-button="false"
              />
            </div>
            
            <!-- 步骤4：高级选项 -->
            <div v-if="currentStep === 4">
              <ProSearchForm
                :form="form"
                :columns="step4Columns"
                label-placement="left"
                :show-submit-button="false"
                :show-reset-button="false"
              />
            </div>
            
            <!-- 步骤5：确认信息 -->
            <div v-if="currentStep === 5">
              <ProSearchForm
                :form="form"
                :columns="step5Columns"
                label-placement="left"
                :show-submit-button="false"
                :show-reset-button="false"
              />
              
              <!-- 确认信息展示 -->
              <div class="mt-32px p-24px bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-16px">{{ $t('page.proNaive.form.queryStep.step5.confirmTitle') }}</h3>
                <div class="grid grid-cols-2 gap-16px">
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step1.appName') }}</p>
                    <p class="font-medium">{{ form.values.appName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step1.appStatus') }}</p>
                    <p class="font-medium">{{ form.values.appStatus || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step2.createTime') }}</p>
                    <p class="font-medium">{{ form.values.createTime ? formatDate(form.values.createTime) : '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step2.responseDate') }}</p>
                    <p class="font-medium">{{ form.values.responseDate ? formatDateTime(form.values.responseDate) : '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step3.userName') }}</p>
                    <p class="font-medium">{{ form.values.userName || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step3.userEmail') }}</p>
                    <p class="font-medium">{{ form.values.userEmail || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step4.priority') }}</p>
                    <p class="font-medium">{{ form.values.priority || '-' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step4.category') }}</p>
                    <p class="font-medium">{{ form.values.category || '-' }}</p>
                  </div>
                </div>
                <div v-if="form.values.tags && form.values.tags.length > 0" class="mt-16px">
                  <p class="text-sm text-gray-500 mb-4px">{{ $t('page.proNaive.form.queryStep.step4.tags') }}</p>
                  <div class="flex flex-wrap gap-4px">
                    <NTag v-for="tag in form.values.tags" :key="tag">{{ tag }}</NTag>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 步骤导航按钮 -->
            <div class="flex justify-between mt-32px">
              <NButton
                :disabled="currentStep === 1 || submiting"
                @click="toPrevStep"
              >
                {{ $t('page.proNaive.form.queryStep.prevStep') }}
              </NButton>
              
              <div class="flex gap-12px">
                <NButton
                  :disabled="submiting"
                  @click="resetForm"
                >
                  {{ $t('page.proNaive.form.queryStep.reset') }}
                </NButton>
                
                <NButton
                  v-if="currentStep < totalSteps"
                  type="primary"
                  :disabled="submiting"
                  @click="toNextStep"
                >
                  {{ $t('page.proNaive.form.queryStep.nextStep') }}
                </NButton>
                
                <NButton
                  v-else
                  type="primary"
                  :loading="submiting"
                  @click="submitForm"
                >
                  {{ $t('page.proNaive.form.queryStep.submit') }}
                </NButton>
              </div>
            </div>
          </div>
        </div>
      </ProCard>
      
      <!-- 列表展示 -->
      <ProDataTable
        :title="$t('page.proNaive.form.queryStep.listTitle')"
        size="small"
        flex-height
        :columns="tableColumns"
        row-key="id"
        v-bind="tableProps"
      />
    </div>
  </ConfigProvider>
</template>