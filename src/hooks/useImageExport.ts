import { useState, RefObject } from 'react';
import html2canvas from 'html2canvas';
import { saveFile } from '../components/Common';

type Status = "idle" | "success" | "error";

export function useImageExport(
    containerRef: RefObject<HTMLDivElement | null>,
    getShortCode: () => string,
    getFilenamePrefix: () => string,
) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<Status>("idle");

    const saveImage = async () => {
        setIsSaving(true);
        setStatus("idle");

        try {
            if (!containerRef.current) {
                throw new Error('Banner container not found');
            }

            const container = containerRef.current;

            const originalStyles = {
                width: container.style.width,
                overflow: container.style.overflow,
                display: container.style.display,
                position: container.style.position,
                paddingBottom: container.style.paddingBottom,
                maxWidth: container.style.maxWidth,
            };

            const flexRowChild = container.querySelector('.flex-row') as HTMLElement;
            if (!flexRowChild) {
                throw new Error('flex-row child not found');
            }

            const compare = container.scrollWidth / flexRowChild.scrollWidth;
            const targetWidth = (compare < 1 || compare > 1.5)
                ? flexRowChild.scrollWidth * 1.1 + 20
                : container.scrollWidth;

            container.style.width = `${targetWidth}px`;
            container.style.maxWidth = `${targetWidth}px`;
            container.style.overflow = 'visible';
            container.style.display = 'block';
            container.style.position = 'relative';
            container.style.paddingBottom = '20px';

            const childElements = container.querySelectorAll('*');
            const childOriginalStyles: Record<string, { overflow: string; overflowX: string; width: string; maxWidth: string }> = {};

            childElements.forEach((el, index) => {
                const element = el as HTMLElement;
                childOriginalStyles[index] = {
                    overflow: element.style.overflow,
                    overflowX: element.style.overflowX,
                    width: element.style.width,
                    maxWidth: element.style.maxWidth,
                };
                element.style.overflowX = 'visible';
                element.style.maxWidth = `${targetWidth}px`;
            });

            const watermark = document.createElement('div');
            container.appendChild(watermark);

            watermark.style.cssText = `
                position: absolute;
                bottom: -20px;
                left: 0;
                width: ${targetWidth}px;
                padding: 8px 0;
                background: rgba(0, 0, 0, 0);
                color: red;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                pointer-events: none;
                z-index: 99999;
                box-sizing: border-box;
            `;

            const shortUrl = await (async () => {
                const sc = getShortCode();
                const url = new URL(window.location.href);
                url.search = new URLSearchParams({ s: sc }).toString();
                return url.toString();
            })();
            watermark.textContent = decodeURIComponent(shortUrl);

            await new Promise(resolve => setTimeout(resolve, 200));

            const contentWidth = targetWidth;
            const contentHeight = container.scrollHeight * 1.05 + 50;

            const canvas = await html2canvas(container, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                logging: false,
                width: contentWidth,
                height: contentHeight,
                windowWidth: contentWidth,
                x: 0,
                y: 0,
            });

            container.removeChild(watermark);

            container.style.width = originalStyles.width;
            container.style.overflow = originalStyles.overflow;
            container.style.display = originalStyles.display;
            container.style.position = originalStyles.position;
            container.style.paddingBottom = originalStyles.paddingBottom;
            container.style.maxWidth = originalStyles.maxWidth;

            childElements.forEach((el, index) => {
                const styles = childOriginalStyles[index];
                const element = el as HTMLElement;
                element.style.overflow = styles.overflow;
                element.style.overflowX = styles.overflowX;
                element.style.width = styles.width;
                element.style.maxWidth = styles.maxWidth;
            });

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const filename = `${getFilenamePrefix()}_${getShortCode()}_${new Date().toISOString().slice(0, 10)}.png`;
                    saveFile(url, filename);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');

            setStatus("success");
        } catch (error) {
            console.error('Failed to save image:', error);
            setStatus("error");
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return { saveImage, isSaving, status };
}
