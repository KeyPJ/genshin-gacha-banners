import { useState, RefObject, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { saveFile } from '../components/Common';

type Status = "idle" | "success" | "error";

async function waitForImages(el: HTMLElement): Promise<void> {
    const images = el.querySelectorAll('img');
    const promises = Array.from(images).map(
        img =>
            new Promise<void>(resolve => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                }
            })
    );
    await Promise.all(promises);
}

export function useImageExport(
    containerRef: RefObject<HTMLDivElement | null>,
    getShortCode: () => string,
    getFilenamePrefix: () => string,
) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<Status>("idle");

    const saveImage = useCallback(async () => {
        if (!containerRef.current) return;

        setIsSaving(true);
        setStatus("idle");

        let clone: HTMLElement | null = null;

        try {
            const original = containerRef.current;

            // 1. 深度克隆容器
            clone = original.cloneNode(true) as HTMLElement;

            // 2. 离屏放置，解除宽度限制让整个表格展示
            clone.style.cssText = `
                position: fixed;
                left: -9999px;
                top: 0;
                width: max-content;
                max-width: none;
                overflow: visible;
                z-index: -1;
                background: ${getComputedStyle(original).backgroundColor || '#0f172a'};
            `;

            // 3. 解除子元素宽度限制
            clone.querySelectorAll('*').forEach(el => {
                const e = el as HTMLElement;
                e.style.maxWidth = 'none';
                e.style.overflowX = 'visible';
                e.style.overflow = 'visible';
            });

            // 4. 挂载到 DOM（之后才能用 getComputedStyle 检测 sticky）
            document.body.appendChild(clone);

            // 5. 取消所有 sticky 定位（离屏后吸附到视口边缘会导致列错位）
            clone.querySelectorAll('*').forEach(el => {
                const e = el as HTMLElement;
                if (getComputedStyle(e).position === 'sticky') {
                    e.style.setProperty('position', 'static', 'important');
                }
            });

            // 生成水印 URL
            const shortCode = getShortCode();
            const url = new URL(window.location.href);
            url.search = new URLSearchParams({ s: shortCode }).toString();
            const watermarkUrl = decodeURIComponent(url.toString());

            // 等待图片加载
            await waitForImages(clone);
            await new Promise(resolve => requestAnimationFrame(resolve));

            // 获取实际内容尺寸
            const flexRow = clone.querySelector('.flex-row') as HTMLElement;
            const contentWidth = flexRow
                ? Math.max(flexRow.scrollWidth, clone.scrollWidth)
                : clone.scrollWidth;
            const contentHeight = clone.scrollHeight;

            // html2canvas 截图
            const canvas = await html2canvas(clone, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                logging: false,
                width: contentWidth,
                height: contentHeight,
                windowWidth: contentWidth,
                x: 0,
                y: 0,
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#e2e6eb',
            });

            // 在 canvas 上下各加一条水印栏
            const padY = 36;
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height + padY * 2;
            const ctx = finalCanvas.getContext('2d')!;

            const isDark = document.documentElement.classList.contains('dark');
            const barColor = isDark ? '#1e293b' : '#f1f5f9';
            const textColor = isDark ? '#64748b' : '#94a3b8';
            const lineColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

            // 全局背景
            ctx.fillStyle = barColor;
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            // 截图内容（从 padY 开始）
            ctx.drawImage(canvas, 0, padY);

            // 上分隔线
            ctx.strokeStyle = lineColor;
            ctx.beginPath();
            ctx.moveTo(0, padY);
            ctx.lineTo(finalCanvas.width, padY);
            ctx.stroke();

            // 下分隔线
            ctx.beginPath();
            ctx.moveTo(0, padY + canvas.height);
            ctx.lineTo(finalCanvas.width, padY + canvas.height);
            ctx.stroke();

            // 水印文字样式
            ctx.fillStyle = textColor;
            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';

            // 顶部水印
            ctx.fillText(watermarkUrl, finalCanvas.width / 2, 22);
            // 底部水印
            ctx.fillText(watermarkUrl, finalCanvas.width / 2, padY + canvas.height + 22);

            // 保存（WebP 0.9 质量，约为 PNG 的 1/8）
            const filename = `${getFilenamePrefix()}_${shortCode}_${new Date().toISOString().slice(0, 10)}.webp`;

            await new Promise<void>((resolve, reject) => {
                finalCanvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob returned null'));
                        return;
                    }
                    try {
                        const blobUrl = URL.createObjectURL(blob);
                        saveFile(blobUrl, filename);
                        // 延迟释放 blob，确保浏览器已启动下载
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }, 'image/webp', 0.9);
            });

            setStatus("success");
        } catch (error) {
            console.error('Failed to save image:', error);
            setStatus("error");
        } finally {
            // 清理克隆节点
            if (clone && clone.parentNode) {
                clone.parentNode.removeChild(clone);
            }
            setIsSaving(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    }, [containerRef, getShortCode, getFilenamePrefix]);

    return { saveImage, isSaving, status };
}
