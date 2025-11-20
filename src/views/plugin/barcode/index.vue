<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import JsBarcode from 'jsbarcode';
import type { Options } from 'jsbarcode';
import jsPDF from 'jspdf';
import 'jspdf/dist/polyfills.es.js';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useLoading } from '@sa/hooks';
import SvgIcon from '@/components/custom/svg-icon.vue';

const message = useMessage();

const text = 'Soybean';

interface CodeConfig {
  id: string;
  title: string;
  text: string;
  options: Options;
}

const codes: CodeConfig[] = [
  {
    id: 'code39',
    title: 'CODE 39 正常尺寸',
    text: 'Hello',
    options: { format: 'code39' }
  },
  {
    id: 'code128',
    title: 'CODE 128 正常尺寸',
    text,
    options: {}
  },
  {
    id: 'ean-13',
    title: 'ENA-13 商品条形码',
    text: '1234567890128',
    options: { format: 'ean13' }
  },
  {
    id: 'upc-a',
    title: 'UPC-A 商品条形码',
    text: '123456789012',
    options: { format: 'upc' }
  },
  {
    id: 'barcode',
    title: '不一样的高度，不一样的颜色',
    text: 'Hello',
    options: {
      height: 30,
      lineColor: '#9ca3af'
    }
  },
  {
    id: 'barcode1',
    title: '加个背景色',
    text,
    options: {
      background: '#9ca3af',
      lineColor: '#ffffff'
    }
  },
  {
    id: 'barcode2',
    title: '字体好大',
    text,
    options: {
      fontSize: 40
    }
  },
  {
    id: 'barcode3',
    title: '粗狂的条码，文字离远点',
    text: 'Hi',
    options: {
      textMargin: 30,
      width: 4
    }
  },
  {
    id: 'barcode4',
    title: '字体跑上面来，还是粗体',
    text,
    options: {
      textPosition: 'top',
      fontOptions: 'bold'
    }
  }
];

function generateBarcode() {
  codes.forEach(code => {
    JsBarcode(`#${code.id}`, code.text, code.options);
  });
}

onMounted(() => {
  generateBarcode();
});

// PDF 导出功能
const { loading, startLoading, endLoading } = useLoading(false);

async function exportToPDF() {
  startLoading();
  try {
    // 创建一个临时的 div 容器用于生成 PDF
    const tempContainer = document.createElement('div');
    // 设置容器可见但不影响页面布局
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '0';
    tempContainer.style.top = '0';
    tempContainer.style.width = '100%';
    tempContainer.style.height = '100%';
    tempContainer.style.zIndex = '9999';
    tempContainer.style.background = 'white';
    tempContainer.innerHTML = `
      <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">条形码类型示例</h1>
      <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
        ${codes
          .map(
            code => `
          <div id="${code.id}-pdf" style="width: 300px; text-align: center; margin-bottom: 20px;">
            <div style="margin-bottom: 10px;">${code.title}</div>
            <svg id="${code.id}-temp" class="h-130px" />
          </div>
        `
          )
          .join('')}
      </div>
    `;
    document.body.appendChild(tempContainer);

    // 在临时容器中重新生成条形码
    codes.forEach(code => {
      const svgElement = document.getElementById(`${code.id}-temp`);
      if (svgElement) {
        JsBarcode(svgElement, code.text, code.options);
        console.log('Generated barcode for', code.id);
      } else {
        console.error('SVG element not found for', code.id);
      }
    });

    // 添加延迟确保内容加载完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 使用 html2canvas 生成图片，设置适当的超时确保内容加载完成
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      timeout: 5000
    });

    // 创建 PDF 文档
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // 添加图片到 PDF
    doc.addImage(canvas, 'PNG', 10, 10, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 处理多页情况
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(canvas, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 清理临时容器
    document.body.removeChild(tempContainer);

    // 获取 PDF 内容作为二进制数据
    const pdfData = doc.output('blob');

    // 检查文件大小是否超过 10M
    const fileSizeInMB = pdfData.size / (1024 * 1024);
    const MAX_SIZE_IN_MB = 10;

    if (fileSizeInMB > MAX_SIZE_IN_MB) {
      // 如果超过 10M，将 PDF 压缩为 ZIP 文件下载
      try {
        // 使用 jszip 创建 ZIP 压缩文件
        const zip = new JSZip();
        zip.file('barcode-examples.pdf', pdfData);
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = 'barcode-examples.zip';
        downloadLink.click();

        URL.revokeObjectURL(downloadLink.href);
        message.success('PDF 文件过大，已压缩为 ZIP 下载');
      } catch (zipError) {
        console.error('ZIP 压缩失败:', zipError);
        message.error('ZIP 压缩失败，将直接下载 PDF');
        // 如果压缩失败，直接下载 PDF
        doc.save('barcode-examples.pdf');
      }
    } else {
      // 如果未超过 10M，直接下载 PDF
      doc.save('barcode-examples.pdf');
      message.success('PDF 导出成功');
    }
  } catch (error) {
    console.error('PDF 导出失败:', error);
    message.error('PDF 导出失败');
  } finally {
    endLoading();
  }
}
</script>

<template>
  <div class="overflow-hidden">
    <NCard title="条形码" :bordered="false" class="h-full card-wrapper" content-class="overflow-hidden">
      <div class="mb-4">
        <NButton type="primary" :loading="loading" @click="exportToPDF">导出 PDF</NButton>
      </div>
      <NScrollbar class="h-full">
        <NGrid cols="1 s:2 l:3" :x-gap="12" :y-gap="24" responsive="screen" item-responsive>
          <NGi v-for="item in codes" :key="item.id">
            <div class="flex-col-center">
              <h3>{{ item.title }}</h3>
              <svg :id="item.id" class="h-130px" />
            </div>
          </NGi>
        </NGrid>
      </NScrollbar>
    </NCard>
  </div>
</template>

<style scoped></style>
