<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { useLoading } from '@sa/hooks';

const { loading, endLoading } = useLoading(true);

const pdfRef = shallowRef<InstanceType<typeof VuePdfEmbed> | null>(null);
const source = ref<string | null>(null);
const pdfError = ref<string | null>(null);

const showAllPages = ref(false);
const currentPage = ref<undefined | number>(1);
const pageCount = ref(1);
const thumbnails = ref<string[]>([]);
const showThumbnails = ref(true);
const thumbnailSize = ref(120); // 默认缩略图宽度
const isGeneratingThumbnails = ref(false);

// 加载PDF源
onMounted(() => {
  // 使用远程PDF文件
  source.value =
    'https://xiaoxian521.github.io/hyperlink/pdf/Cookie%E5%92%8CSession%E5%8C%BA%E5%88%AB%E7%94%A8%E6%B3%95.pdf';
});

// 生成页面缩略图
async function generateThumbnails() {
  if (!pdfRef.value?.doc) return;

  isGeneratingThumbnails.value = true;
  const doc = pdfRef.value.doc;
  const newThumbnails: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 0.2 }); // 生成缩略图的缩放比例
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport
    };

    await page.render(renderContext).promise;
    newThumbnails.push(canvas.toDataURL());
  }

  thumbnails.value = newThumbnails;
  isGeneratingThumbnails.value = false;
}

function onPdfRendered() {
  endLoading();
  pdfError.value = null;

  if (pdfRef.value?.doc) {
    pageCount.value = pdfRef.value.doc.numPages;
    generateThumbnails();
  }
}

function onPdfError(error: any) {
  endLoading();
  pdfError.value = 'PDF加载失败，请检查文件是否存在或格式是否正确';
  console.error('PDF加载错误:', error);
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
function jumpToPage(page: number) {
  currentPage.value = page;
  showAllPages.value = false;
}

// 调整缩略图大小
function adjustThumbnailSize(size: number) {
  thumbnailSize.value = size;
}
</script>

<template>
  <div class="overflow-hidden">
    <NCard title="PDF 预览" :bordered="false" class="h-full card-wrapper" content-class="overflow-hidden">
      <div class="h-full flex-col-stretch">
        <GithubLink link="https://github.com/hrynko/vue-pdf-embed" />
        <WebSiteLink label="文档地址：" link="https://www.npmjs.com/package/vue-pdf-embed" />
        <div class="flex-y-center justify-end gap-12px">
          <NCheckbox v-model:checked="showAllPages" @update:checked="showAllPagesChange">显示所有页面</NCheckbox>
          <NCheckbox v-model:checked="showThumbnails">显示缩略图</NCheckbox>
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
        <div class="flex flex-1-hidden gap-12px">
          <!-- 缩略图侧边栏 -->
          <div
            v-if="showThumbnails && thumbnails.length > 0"
            class="flex flex-col gap-8px transition-all duration-300"
            :style="{ width: `${Math.max(thumbnailSize + 40, 200)}px` }"
          >
            <div class="flex-y-center justify-between">
              <span class="text-14px font-medium">页面缩略图</span>
              <div class="flex gap-4px">
                <NButton size="tiny" @click="adjustThumbnailSize(80)">小</NButton>
                <NButton size="tiny" @click="adjustThumbnailSize(120)">中</NButton>
                <NButton size="tiny" @click="adjustThumbnailSize(160)">大</NButton>
              </div>
            </div>
            <NScrollbar class="flex-1-hidden">
              <div class="flex flex-col gap-8px p-4px">
                <div
                  v-for="(thumbnail, index) in thumbnails"
                  :key="index"
                  class="cursor-pointer border-2 rounded transition-all duration-300 hover:shadow-md"
                  :class="{
                    'border-primary bg-primary/5': currentPage === index + 1 && !showAllPages,
                    'border-transparent': !(currentPage === index + 1 && !showAllPages)
                  }"
                  :style="{ minHeight: `${thumbnailSize * 1.414 + 24}px` }"
                  @click="jumpToPage(index + 1)"
                >
                  <img
                    :src="thumbnail"
                    :style="{ width: `${thumbnailSize}px` }"
                    class="mx-auto rounded"
                    alt="Page {{ index + 1 }}"
                    loading="lazy"
                  />
                  <div class="mt-2px text-center text-12px">{{ index + 1 }}</div>
                </div>
              </div>
            </NScrollbar>
          </div>

          <!-- PDF 内容区域 -->
          <div class="flex-1 transition-all duration-300">
            <NScrollbar class="h-full">
              <NSkeleton v-if="loading" size="small" class="mt-12px" text :repeat="12" />
              <div v-else-if="isGeneratingThumbnails" class="mt-12px">
                <NSkeleton size="small" text :repeat="6" />
              </div>
              <div v-else-if="pdfError" class="mt-12px text-center text-red-500">
                {{ pdfError }}
              </div>
              <div v-else-if="source" class="container overflow-auto">
                <VuePdfEmbed
                  ref="pdfRef"
                  :rotation="rotations[currentRotation]"
                  :page="currentPage"
                  :source="source"
                  @rendered="onPdfRendered"
                  @error="onPdfError"
                />
              </div>
              <div v-else class="mt-12px text-center text-gray-500">请设置PDF文件路径</div>
            </NScrollbar>
          </div>
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
  align-items: flex-start;
  padding: 20px;
}
</style>
