<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useBoolean } from '@sa/hooks';
import { $t } from '@/locales';
import { usePropertyPermissionStore } from '@/store/modules/propertyPermission';

interface Props {
  visible: boolean;
  roleId: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const propertyPermissionStore = usePropertyPermissionStore();

// 所有页面属性配置
const allProperties = ref<Api.PropertyPermission.PageProperty[]>([]);

// 角色的属性配置
const roleProperties = ref<Map<string, boolean>>(new Map());

// 是否正在加载
const loading = ref(false);

// 获取所有属性配置
async function loadProperties() {
  loading.value = true;
  try {
    const properties = await propertyPermissionStore.loadAllProperties();
    allProperties.value = properties;
    // 为每个属性设置默认值（允许所有）
    properties.forEach(prop => {
      roleProperties.value.set(`${prop.pageKey}-${prop.propertyKey}`, true);
    });
  } catch (error) {
    console.error('加载属性配置失败:', error);
  } finally {
    loading.value = false;
  }
}

// 保存属性权限配置
async function savePermissions() {
  try {
    // 转换为API需要的格式
    const permissions = Array.from(roleProperties.value.entries())
      .filter(([key, value]) => value)
      .map(([key]) => {
        const [pageKey, propertyKey] = key.split('-');
        return { pageKey, propertyKey };
      });

    // 保存配置到store
    await propertyPermissionStore.updatePropertyPermission({
      roleId: props.roleId,
      properties: permissions
    });

    window.$message?.success($t('common.saveSuccess'));
    closeModal();
  } catch (error) {
    console.error('保存属性权限失败:', error);
    window.$message?.error($t('common.saveFailed'));
  }
}

// 关闭模态框
function closeModal() {
  emit('update:visible', false);
}

// 切换属性权限
function togglePermission(pageKey: string, propertyKey: string) {
  const key = `${pageKey}-${propertyKey}`;
  roleProperties.value.set(key, !roleProperties.value.get(key));
}

// 检查属性权限
function hasPermission(pageKey: string, propertyKey: string): boolean {
  return roleProperties.value.get(`${pageKey}-${propertyKey}`) || false;
}

// 当角色ID变化时重新加载配置
watch(() => props.roleId, () => {
  if (props.visible) {
    loadProperties();
  }
});

// 当模态框显示时加载配置
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadProperties();
  }
});
</script>

<template>
  <NModal
    v-model:show="props.visible"
    :title="$t('page.manage.role.propertyAuth')"
    preset="dialog"
    :style="{ width: '600px' }"
    @update:show="emit('update:visible', $event)"
  >
    <div class="property-auth-modal">
      <NSpin :show="loading">
        <NCard size="small" :bordered="false" class="mb-8px" v-for="page in allProperties" :key="page.pageKey">
          <template #header>
            <h4>{{ page.pageName }}</h4>
          </template>
          <NSpace direction="vertical" :size="12">
            <NCheckbox
              v-for="property in page.properties"
              :key="property.propertyKey"
              v-model:checked="hasPermission(page.pageKey, property.propertyKey)"
              @update:checked="togglePermission(page.pageKey, property.propertyKey)"
            >
              {{ property.propertyName }}
            </NCheckbox>
          </NSpace>
        </NCard>
        
        <div v-if="allProperties.length === 0" class="text-center py-24px">
          {{ $t('common.noData') }}
        </div>
      </NSpin>
    </div>
    
    <template #footer>
      <NSpace :size="16">
        <NButton @click="closeModal">{{ $t('common.cancel') }}</NButton>
        <NButton type="primary" @click="savePermissions">{{ $t('common.confirm') }}</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.property-auth-modal {
  max-height: 400px;
  overflow-y: auto;
}
</style>