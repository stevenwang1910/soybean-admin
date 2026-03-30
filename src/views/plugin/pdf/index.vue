<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { useLoading } from '@sa/hooks';

const { loading, endLoading } = useLoading(true);

const pdfRef = shallowRef<InstanceType<typeof VuePdfEmbed> | null>(null);
const source = `https://xiaoxian521.github.io/hyperlink/pdf/Cookie%E5%92%8CSession%E5%8C%BA%E5%88%AB%E7%94%A8%E6%B3%95.pdf`;

const showAllPages = ref(false);
const currentPage = ref<undefined | number>(1);
const pageCount = ref(1);
const showThumbnails = ref(true);
const thumbnailSize = ref(120);
const thumbnails = ref<string[]>([]);

function onPdfRendered() {
  endLoading();

  if (pdfRef.value?.doc) {
    pageCount.value = pdfRef.value.doc.numPages;
    generateThumbnails();
  }
}

watch(thumbnailSize, () => {
  generateThumbnails();
});

async function generateThumbnails() {
  if (!pdfRef.value?.doc) return;

  const newThumbnails: string[] = [];
  for (let i = 1; i <= pageCount.value; i++) {
    try {
      const canvas = document.createElement('canvas');
      const page = await pdfRef.value.doc.getPage(i);

      // 根据thumbnailSize计算合适的缩放比例，确保所有缩略图宽度一致
      const originalViewport = page.getViewport({ scale: 1 });
      const scale = thumbnailSize.value / originalViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const context = canvas.getContext('2d');
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        newThumbnails.push(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Failed to generate thumbnail for page', i, error);
      newThumbnails.push('');
    }
  }
  thumbnails.value = newThumbnails;
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

function goToPage(page: number) {
  currentPage.value = page;
  showAllPages.value = false;
}

const thumbnailSizeOptions = [
  { label: '80px', value: 80 },
  { label: '100px', value: 100 },
  { label: '120px', value: 120 },
  { label: '140px', value: 140 },
  { label: '160px', value: 160 }
];
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
          <NSelect
            v-model:value="thumbnailSize"
            :options="thumbnailSizeOptions"
            placeholder="缩略图大小"
            size="small"
            style="width: 100px"
          />
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
          <!-- PDF 主内容 -->
          <div class="flex-1 overflow-hidden">
            <NScrollbar class="h-full">
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
          </div>

          <!-- 缩略图侧边栏 -->
          <NScrollbar
            v-if="showThumbnails && !loading && thumbnails.length > 0"
            class="w-160px overflow-y-auto border-l border-gray-200"
          >
            <div class="p-8px space-y-8px">
              <div
                v-for="(thumbnail, index) in thumbnails"
                :key="index"
                class="cursor-pointer border-2 rounded p-2 transition-all hover:shadow-md"
                :class="{
                  'border-primary': currentPage === index + 1 && !showAllPages,
                  'border-gray-300': !(currentPage === index + 1 && !showAllPages)
                }"
                @click="goToPage(index + 1)"
              >
                <img
                  v-if="thumbnail"
                  :src="thumbnail"
                  :style="{ width: `${thumbnailSize}px`, height: 'auto' }"
                  class="rounded"
                  alt="Page {{ index + 1 }}"
                />
                <div
                  v-else
                  :style="{ width: `${thumbnailSize}px`, height: `${thumbnailSize * 1.414}px` }"
                  class="flex items-center justify-center rounded bg-gray-100 text-gray-500"
                >
                  加载失败
                </div>
                <div class="mt-2 text-center text-sm font-medium">
                  {{ index + 1 }}
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

<style scoped></style>
