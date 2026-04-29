import { useState, useEffect, useRef, useCallback } from 'react';
import { isMobile } from 'react-device-detect';

export function useOrientation() {
    const [isPortrait, setIsPortrait] = useState(false);
    const [showOrientationTip, setShowOrientationTip] = useState(() => {
        return isMobile && !localStorage.getItem('orientationTipDismissed');
    });
    const [showScrollNotice, setShowScrollNotice] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const dismissTip = useCallback(() => {
        localStorage.setItem('orientationTipDismissed', 'true');
        setShowOrientationTip(false);
    }, []);

    useEffect(() => {
        const checkOrientation = () => {
            if (isMobile) {
                const portrait = window.innerHeight > window.innerWidth;
                setIsPortrait(portrait);
                setShowOrientationTip(portrait && !localStorage.getItem('orientationTipDismissed'));
            }
        };

        const checkScrollContainerWidth = () => {
            if (containerRef.current) {
                const container = containerRef.current;
                const flexRowChild = container.querySelector('.flex-row') as HTMLElement;
                if (flexRowChild) {
                    const hasHorizontalScroll = flexRowChild.scrollWidth > container.clientWidth;
                    setShowScrollNotice(hasHorizontalScroll);
                }
            }
        };

        checkOrientation();
        checkScrollContainerWidth();

        const handleResize = () => {
            checkOrientation();
            checkScrollContainerWidth();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        const resizeObserver = new ResizeObserver(() => {
            checkScrollContainerWidth();
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, []);

    return { isPortrait, showOrientationTip, showScrollNotice, dismissTip, containerRef };
}
