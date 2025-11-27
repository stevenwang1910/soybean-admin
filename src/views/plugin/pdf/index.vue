<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { useLoading } from '@sa/hooks';

const { loading, endLoading } = useLoading(true);

const pdfRef = shallowRef<InstanceType<typeof VuePdfEmbed> | null>(null);
const source = `https://xiaoxian521.github.io/hyperlink/pdf/Cookie%E5%92%8CSession%E5%8C%BA%E5%88%AB%E7%94%A8%E6%B3%95.pdf`;

const showAllPages = ref(false);
const currentPage = ref<undefined | number>(1);
const pageCount = ref(1);
const thumbnails = ref<string[]>([]);
const thumbnailSize = ref(150);
const showThumbnails = ref(true);

async function onPdfRendered() {
  endLoading();

  if (pdfRef.value?.doc) {
    // 等待PDF文档完全加载
    await pdfRef.value.doc.promise;
    pageCount.value = pdfRef.value.doc.numPages;
    generateThumbnails();
  }
}

// 生成缩略图
async function generateThumbnails() {
  if (!pdfRef.value?.doc) return;

  thumbnails.value = [];
  const pdfDoc = pdfRef.value.doc;

  // 确保PDF文档完全加载
  await pdfDoc.promise;

  // 初始化thumbnails数组
  thumbnails.value = new Array(pdfDoc.numPages).fill(null);

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    // 使用IIFE创建闭包，确保每个任务都能正确获取到当前的i值
    (async pageNum => {
      try {
        // 加载指定页面
        const page = await pdfDoc.getPage(pageNum);

        // 设置缩略图尺寸
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // 渲染页面到画布
          const renderContext = {
            canvasContext: context,
            viewport
          };

          await page.render(renderContext).promise;

          // 将画布转换为DataURL
          const dataUrl = canvas.toDataURL();

          // 释放页面资源
          page.cleanup();

          // 更新thumbnails数组
          thumbnails.value[pageNum - 1] = dataUrl;
        }
      } catch (error) {
        console.error(`生成第${pageNum}页缩略图失败:`, error);
        // 返回一个占位符图片
        thumbnails.value[pageNum - 1] =
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0U5MzQzMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFBhZ2U8L3RleHQ+PC9zdmc+';
      }
    })(i);
  }
}

function showAllPagesChange() {
  currentPage.value = showAllPages.value ? undefined : 1;
}

const rotations = [0, 90, 180, 270];
const currentRotation = ref(0);

function handleRotate() {
  currentRotation.value = (currentRotation.value + 1) % 4;
}

async function handlePrint() {
  await pdfRef.value?.print(undefined, 'test.pdf', true);
}

async function handleDownload() {
  await pdfRef.value?.download('test.pdf');
}

// 点击缩略图跳转到对应页面
function goToPage(page: number) {
  currentPage.value = page;
  showAllPages.value = false;
}

// 调整缩略图大小
function adjustThumbnailSize(size: number) {
  thumbnailSize.value = size;
}

// 监听PDF加载完成
watch(pdfRef, async newRef => {
  if (newRef?.doc) {
    generateThumbnails();
  }
});

// 组件挂载时加载PDF
onMounted(() => {
  // PDF加载由VuePdfEmbed组件自动处理
});
</script>

<template>
  <div class="h-full overflow-hidden">
    <NCard title="PDF 预览" :bordered="false" class="h-full card-wrapper" content-class="overflow-hidden">
      <div class="h-full flex-col-stretch">
        <GithubLink link="https://github.com/hrynko/vue-pdf-embed" />
        <WebSiteLink label="文档地址：" link="https://www.npmjs.com/package/vue-pdf-embed" />
        <div class="flex-y-center justify-between gap-12px">
          <div class="flex-y-center gap-12px">
            <NCheckbox v-model:checked="showThumbnails">显示缩略图</NCheckbox>
            <div v-if="showThumbnails" class="flex-y-center gap-8px">
              <span>缩略图大小：</span>
              <NSlider v-model:value="thumbnailSize" :min="100" :max="250" :step="10" />
              <span>{{ thumbnailSize }}px</span>
            </div>
          </div>
          <div class="flex-y-center gap-12px">
            <NCheckbox v-model:checked="showAllPages" @update:checked="showAllPagesChange">显示所有页面</NCheckbox>
            <ButtonIcon tooltip-content="旋转90度" @click="handleRotate">
              <icon-material-symbols-light:rotate-90-degrees-ccw-outline-rounded />
            </ButtonIcon>
            <ButtonIcon tooltip-content="打印" @click="handlePrint">
              <icon-mdi:printer />
            </ButtonIcon>
            <ButtonIcon tooltip-content="下载" @click="handleDownload">
              <icon-charm:download />
            </ButtonIcon>
          </div>
        </div>
        <div class="flex flex-1-hidden gap-12px">
          <!-- PDF 预览区域 -->
          <NScrollbar class="flex-1">
            <NSkeleton v-if="loading" size="small" class="mt-12px" text :repeat="12" />
            <VuePdfEmbed
              ref="pdfRef"
              class="container overflow-auto"
              :class="{ 'h-0': loading }"
              :rotation="rotations[currentRotation]"
              :page="currentPage"
              :source="source"
              @rendered="onPdfRendered"
            />
          </NScrollbar>

          <!-- 缩略图导航区域 -->
          <NScrollbar v-if="showThumbnails && thumbnails.length > 0" class="w-64 bg-gray-50">
            <div class="p-4">
              <h3 class="mb-4 text-sm font-medium">页面缩略图</h3>
              <div class="space-y-4">
                <div
                  v-for="(thumbnail, index) in thumbnails"
                  :key="index"
                  class="cursor-pointer border-2 rounded transition-all hover:border-primary hover:shadow-md"
                  :class="{
                    'border-primary bg-primary/5': currentPage === index + 1 && !showAllPages,
                    'border-transparent': currentPage !== index + 1 || showAllPages
                  }"
                  @click="goToPage(index + 1)"
                >
                  <img
                    :src="thumbnail"
                    :style="{ width: `${thumbnailSize}px`, height: 'auto' }"
                    class="rounded"
                    :alt="`第${index + 1}页`"
                  />
                  <div class="mt-1 text-center text-xs">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </NScrollbar>
        </div>
        <div class="flex-y-center justify-between">
          <div v-if="showAllPages" class="text-18px font-medium">共{{ pageCount }}页</div>
          <NPagination v-else v-model:page="currentPage" :page-count="pageCount" :page-size="1" />
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.container >>> .vue-pdf-embed {
  max-width: 100%;
  height: auto;
}
</style>
