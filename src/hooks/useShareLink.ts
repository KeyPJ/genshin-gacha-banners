import { useState } from 'react';
import html2canvas from 'html2canvas';
import { saveFile, copyToClipboard } from '../components/Common';

type Status = "idle" | "success" | "error";

export function useShareLink(getShortCode: () => string) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<Status>("idle");

    const generateIndexBasedShortUrl = async () => {
        setIsGenerating(true);
        setStatus("idle");

        try {
            const shortCode = getShortCode();
            const newUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams();
            searchParams.set('s', shortCode);
            newUrl.search = searchParams.toString();
            return newUrl.toString();
        } catch (error) {
            console.error('Failed to generate short URL:', error);
            setStatus("error");
            return null;
        } finally {
            setIsGenerating(false);
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const share = async () => {
        try {
            const urlToShare = await generateIndexBasedShortUrl();
            if (!urlToShare) return;

            if (navigator.share) {
                await navigator.share({
                    title: document.title,
                    url: urlToShare,
                });
                return;
            }

            const success = await copyToClipboard(urlToShare);
            setStatus(success ? "success" : "error");
        } catch (error) {
            console.error('Share failed:', error);
            setStatus("error");
        }
    };

    return { share, isGenerating, status, getShortUrl: generateIndexBasedShortUrl };
}
