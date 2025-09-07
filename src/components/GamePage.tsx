import React, {useEffect, useState, useRef} from 'react';
import {withRouter, RouteComponentProps, Link} from 'react-router-dom';
import '../App.css';
import BannersShow from "../components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";
import GithubCorner from "react-github-corner";
import {useTranslation} from "react-i18next";
import {isMobile} from "react-device-detect";
import html2canvas from "html2canvas";
import {classNames, generateOptionEle, Option} from "./Common";
import FilterSection from "../components/FilterSection";

// 公共属性接口
interface GameConfig {
    gameKey: string;
    itemTypeList: Option[];
    rankTypeList: Option[];
    weaponTypeOptions: string;
    elementOptions: string;
    versionOptions: string;
    weaponImagePath?: string;
    elementImagePath?: string;
}

// 页面属性
interface GamePageProps extends RouteComponentProps {
    config: GameConfig;
}

// 工具函数：通过索引获取选项
const getOptionByIndex = (index: number, options: Option[]): Option => {
    return options[Math.max(0, Math.min(index, options.length - 1))];
};

const GamePage = ({history, location, config}: GamePageProps) => {
    const {t, i18n} = useTranslation();
    const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false);
    const [isSavingImage, setIsSavingImage] = useState(false);
    const [shareStatus, setShareStatus] = useState<"idle" | "success" | "error">("idle");
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const bannerContainerRef = useRef<HTMLDivElement>(null);

    // 横屏检测相关状态
    const [isPortrait, setIsPortrait] = useState(false);
    const [showOrientationTip, setShowOrientationTip] = useState(() => {
        return isMobile && !localStorage.getItem('orientationTipDismissed');
    }); // 控制是否显示提示

    // 新增屏幕方向检测副作用
    useEffect(() => {
        const checkOrientation = () => {
            if (isMobile) {
                const portrait = window.innerHeight > window.innerWidth;
                setIsPortrait(portrait);
                // 只在以下情况显示提示：
                // 1. 处于竖屏状态
                // 2. 用户从未关闭过提示（localStorage中无记录）
                if (portrait) {
                    setShowOrientationTip(!localStorage.getItem('orientationTipDismissed'));
                }
            }
        };

        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.removeEventListener('orientationchange', checkOrientation);
        };
    }, [isMobile]);


    // 生成选项列表
    const weaponTypeList = generateOptionEle(config.weaponTypeOptions, t);
    const elementList = generateOptionEle(config.elementOptions, t);
    const versionList = generateOptionEle(config.versionOptions, t);

    // 从URL参数初始化状态（包含currentGachaItemId处理）
    const initFromParams = () => {
        const searchParams = new URLSearchParams(location.search);
        const s = searchParams.get('s');

        if (s) {
            return parseShortCode(s);
        }

        // 直接从URL参数获取currentGachaItemId
        const gachaIds = searchParams.get('itemId');
        const currentGachaItemId = gachaIds
            ? gachaIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : [];

        return {
            itemType: getOptionByIndex(
                parseInt(searchParams.get('t') || '0'),
                config.itemTypeList
            ),
            rankType: getOptionByIndex(
                parseInt(searchParams.get('r') || '1'),
                config.rankTypeList
            ),
            language: localStorage.getItem('globalAppLanguage') || searchParams.get('lang') || 'zh-CN',
            weaponType: getOptionByIndex(
                parseInt(searchParams.get('w') || '0'),
                weaponTypeList
            ),
            elementType: getOptionByIndex(
                parseInt(searchParams.get('e') || '0'),
                elementList
            ),
            version: getOptionByIndex(
                parseInt(searchParams.get('v') || (versionList.length - 1).toString()),
                versionList
            ),
            currentGachaItemId
        };
    };

    // 解析短链接代码（支持currentGachaItemId）
    const parseShortCode = (code: string) => {
        const [basePart, gachaItemIdPart] = code.split('|');
        const parts = basePart.split('');

        // 解析currentGachaItemId
        const currentGachaItemId = gachaItemIdPart
            ? gachaItemIdPart.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : [];

        return {
            itemType: getOptionByIndex(parseInt(parts[0] || '0'), config.itemTypeList),
            rankType: getOptionByIndex(parseInt(parts[1] || '1'), config.rankTypeList),
            weaponType: getOptionByIndex(parseInt(parts[2] || '0'), weaponTypeList),
            elementType: getOptionByIndex(parseInt(parts[3] || '0'), elementList),
            version: getOptionByIndex(parseInt(parts[4] || (versionList.length - 1).toString()), versionList),
            language: localStorage.getItem('globalAppLanguage') || 'zh-CN',
            currentGachaItemId
        };
    };

    // 生成短链接代码（包含currentGachaItemId）
    const generateShortCode = (): string => {
        const baseCode = [
            getOptionIndex(itemType.value, config.itemTypeList),
            getOptionIndex(rankType.value, config.rankTypeList),
            getOptionIndex(weaponType.value, weaponTypeList),
            getOptionIndex(elementType.value, elementList),
            getOptionIndex(version.value, versionList),
        ].join('');

        // 拼接currentGachaItemId（使用|分隔）
        if (currentGachaItemId.length > 0) {
            return `${baseCode}|${currentGachaItemId.join(',')}`;
        }

        return baseCode;
    };

    // 初始化状态
    const initialState = initFromParams();
    const [itemType, setItemType] = useState(initialState.itemType);
    const [rankType, setRankType] = useState(initialState.rankType);
    const [language, setLanguage] = useState(initialState.language);
    const [weaponType, setWeaponType] = useState(initialState.weaponType);
    const [elementType, setElementType] = useState(initialState.elementType);
    const [version, setVersion] = useState(initialState.version);
    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>(initialState.currentGachaItemId || []);

    const [data, setData] = useState<gachaData[]>([]);
    const [showGachaVersions, setShowGachaVersions] = useState<string[]>([]);

    const languageOptions = [
        {code: "zh-CN", value: "中文"},
        {code: "en-US", value: "English"}
    ];

    // 语言切换处理
    const changeLanguage = (value: string) => {
        setLanguage(value);
        i18n.changeLanguage(value);
    };

    // 更新URL参数（包含currentGachaItemId）
    const updateURLParams = () => {
        const searchParams = new URLSearchParams();
        searchParams.delete('s');

        searchParams.set('t', getOptionIndex(itemType.value, config.itemTypeList).toString());
        searchParams.set('r', getOptionIndex(rankType.value, config.rankTypeList).toString());
        searchParams.set('w', getOptionIndex(weaponType.value, weaponTypeList).toString());
        searchParams.set('e', getOptionIndex(elementType.value, elementList).toString());
        searchParams.set('v', getOptionIndex(version.value, versionList).toString());

        // 添加currentGachaItemId参数
        if (currentGachaItemId.length > 0) {
            searchParams.set('itemId', currentGachaItemId.join(','));
        }

        history.push({
            pathname: location.pathname,
            search: searchParams.toString()
        });
    };

    // 数据加载
    const loadData = async () => {
        try {
            const endpoint = `/data/${config.gameKey}/${itemType.value.toLowerCase()}.json`;
            const response = await axios.get(endpoint);
            const resData = response.data as gachaData[];

            const filteredData = resData
                .filter(item => item.start < new Date().toISOString())
                .reverse();

            setData(filteredData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    // 数据加载副作用
    useEffect(() => {
        loadData();
        i18n.changeLanguage(language);
    }, [itemType, language, config.gameKey]);

    // 筛选条件变化时更新URL
    useEffect(() => {
        updateURLParams();
    }, [itemType, rankType, weaponType, elementType, version, currentGachaItemId]);

    // 语言持久化
    useEffect(() => {
        const savedLang = localStorage.getItem('globalAppLanguage');

        if (savedLang && savedLang !== i18n.language) {
            i18n.changeLanguage(savedLang);
        } else if (!savedLang) {
            localStorage.setItem('globalAppLanguage', i18n.language);
        }

        const languageChangeHandler = (lng: string) => {
            localStorage.setItem('globalAppLanguage', lng);
        };

        i18n.on('languageChanged', languageChangeHandler);

        return () => {
            i18n.off('languageChanged', languageChangeHandler);
        };
    }, [i18n]);

    // 在数据加载完成后处理currentGachaItemId和showGachaVersions的关联逻辑
    useEffect(() => {
        // 当数据加载完成且currentGachaItemId有且仅有一个值时
        if (data.length > 0 && currentGachaItemId.length === 1) {
            const targetId = currentGachaItemId[0];
            // 从数据中过滤出包含目标ID的版本
            const filteredVersions = data
                .filter(d => d.items.some(gacha => gacha.itemId === targetId))
                .map(item => item.version);
            // 去重并赋值给showGachaVersions
            setShowGachaVersions([...new Set(filteredVersions)]);
        }
    }, [data, currentGachaItemId]);

    // 在原有状态定义中添加
    const [showScrollNotice, setShowScrollNotice] = useState(false);


    // 添加滚动容器宽度检测的副作用
    useEffect(() => {
        const checkScrollContainerWidth = () => {
            if (bannerContainerRef.current) {
                const container = bannerContainerRef.current;
                // 检查容器内容宽度是否超过可视宽度
                // 查找flex-row布局的子元素
                const flexRowChild = container.querySelector(
                    '.flex-row'
                ) as HTMLElement;

                if (!flexRowChild) {
                    return
                    // throw new Error('未找到flex-row子元素');
                }
                const hasHorizontalScroll = flexRowChild.scrollWidth > container.clientWidth;
                setShowScrollNotice(hasHorizontalScroll);
            }
        };

        // 初始检查
        checkScrollContainerWidth();

        // 监听窗口大小变化和容器大小变化
        window.addEventListener('resize', checkScrollContainerWidth);

        // 为滚动容器添加ResizeObserver监测尺寸变化
        const resizeObserver = new ResizeObserver(entries => {
            checkScrollContainerWidth();
        });

        if (bannerContainerRef.current) {
            resizeObserver.observe(bannerContainerRef.current);
        }

        return () => {
            window.removeEventListener('resize', checkScrollContainerWidth);
            if (bannerContainerRef.current) {
                resizeObserver.unobserve(bannerContainerRef.current);
            }
        };
    }, [itemType, rankType, weaponType, elementType, version, currentGachaItemId]); // 当数据变化时重新检查

    // 生成短链接
    const generateIndexBasedShortUrl = async () => {
        setIsGeneratingShortUrl(true);
        setShareStatus("idle");

        try {
            const shortCode = generateShortCode();
            const newUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams();
            searchParams.set('s', shortCode);

            newUrl.search = searchParams.toString();
            return newUrl.toString();
        } catch (error) {
            console.error('Failed to generate short URL:', error);
            setShareStatus("error");
            return null;
        } finally {
            setIsGeneratingShortUrl(false);
            setTimeout(() => setShareStatus("idle"), 3000);
        }
    };

    // 分享功能
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
            setShareStatus(success ? "success" : "error");
        } catch (error) {
            console.error('Share failed:', error);
            setShareStatus("error");
        }
    };

    // 保存图片功能
    const saveImage = async () => {
        setIsSavingImage(true);
        setSaveStatus("idle");

        try {
            if (!bannerContainerRef.current) {
                throw new Error('Banner container not found');
            }

            const container = bannerContainerRef.current;
            // 保存原始样式
            const originalStyles = {
                width: container.style.width,
                overflow: container.style.overflow,
                display: container.style.display,
                position: container.style.position,
                paddingBottom: container.style.paddingBottom,
                maxWidth: container.style.maxWidth
            };

            // 查找flex-row布局的子元素
            const flexRowChild = container.querySelector(
                '.flex-row'
            ) as HTMLElement;

            if (!flexRowChild) {
                throw new Error('未找到flex-row子元素');
            }

            // 获取flex-row子元素的实际宽度
            // const targetWidth = flexRowChild.scrollWidth;
            let compare = container.scrollWidth / flexRowChild.scrollWidth;
            const targetWidth = (compare < 1 || compare > 1.5) ? flexRowChild.scrollWidth * 1.1 + 20 : container.scrollWidth;

            console.log("container.scrollWidth", container.scrollWidth)
            console.log("flexRowChild.scrollWidth", flexRowChild.scrollWidth)
            console.log("///", container.scrollWidth / flexRowChild.scrollWidth > 1.5)

            // 临时调整容器，使其宽度与flex-row子元素一致
            container.style.width = `${targetWidth}px`; // 关键：容器宽度匹配flex元素
            container.style.maxWidth = `${targetWidth}px`; // 限制最大宽度
            container.style.overflow = 'visible';
            container.style.display = 'block';
            container.style.position = 'relative';
            container.style.paddingBottom = '20px'; // 为水印预留空间

            // 保存子元素原始样式并调整
            const childElements = container.querySelectorAll('*');
            const childOriginalStyles: {
                [key: string]: {
                    overflow: string;
                    overflowX: string;
                    width: string;
                    maxWidth: string;
                }
            } = {};

            childElements.forEach((el, index) => {
                let element = el as HTMLElement;
                childOriginalStyles[index] = {
                    overflow: element.style.overflow,
                    overflowX: element.style.overflowX,
                    width: element.style.width,
                    maxWidth: element.style.maxWidth
                };
                // el.style.overflow = 'visible';
                element.style.overflowX = 'visible';
                // 确保子元素不超过目标宽度
                element.style.maxWidth = `${targetWidth}px`;
            });

            // 创建水印元素（宽度与flex-row子元素一致）
            const watermark = document.createElement('div');
            container.appendChild(watermark);

            watermark.style.cssText = `
            position: absolute;
            bottom: -20px;
            left: 0;
            width: ${targetWidth}px; /* 与flex-row子元素宽度一致 */
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
            watermark.textContent = window.location.href.split('?')[0];

            // 等待DOM更新和样式生效
            await new Promise(resolve => setTimeout(resolve, 200));

            // 获取与flex-row匹配的内容尺寸
            const contentWidth = targetWidth; // 直接使用flex元素宽度
            const contentHeight = container.scrollHeight * 1.05 + 50;

            const canvas = await html2canvas(container, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                logging: false,
                width: contentWidth,    // 截图宽度匹配flex元素
                height: contentHeight,
                windowWidth: contentWidth, // 窗口宽度匹配，避免右侧空白
                x: 0,
                y: 0,
            });

            // 移除水印
            container.removeChild(watermark);

            // 恢复原始样式
            container.style.width = originalStyles.width;
            container.style.overflow = originalStyles.overflow;
            container.style.display = originalStyles.display;
            container.style.position = originalStyles.position;
            container.style.paddingBottom = originalStyles.paddingBottom;
            container.style.maxWidth = originalStyles.maxWidth;

            childElements.forEach((el, index) => {
                const styles = childOriginalStyles[index];
                let element = el as HTMLElement;
                element.style.overflow = styles.overflow;
                element.style.overflowX = styles.overflowX;
                element.style.width = styles.width;
                element.style.maxWidth = styles.maxWidth;
            });

            // 处理图片保存
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    saveFile(url, `${itemType.value}_banners_${new Date().toISOString().slice(0, 10)}.png`);
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');

            setSaveStatus("success");
        } catch (error) {
            console.error('Failed to save image:', error);
            setSaveStatus("error");
        } finally {
            setIsSavingImage(false);
            setTimeout(() => setSaveStatus("idle"), 3000);
        }
    };


    // 重置筛选条件
    const reset = () => {
        setRankType(config.rankTypeList[0]);
        setWeaponType(weaponTypeList[0]);
        setElementType(elementList[0]);
        setVersion(versionList[versionList.length - 1]);
        setCurrentGachaItemId([]);
    };

    // 获取选项索引
    const getOptionIndex = (value: string, options: Option[]): number => {
        const index = options.findIndex(option => option.value === value);
        return index === -1 ? 0 : index;
    };

    // 复制到剪贴板
    const copyToClipboard = async (text: string): Promise<boolean> => {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.error('Clipboard API failed:', error);
            }
        }

        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, text.length);

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (error) {
            console.error('Fallback copy failed:', error);
            return false;
        }
    };

    const isSNS = /weibo|qq/i.test(navigator.userAgent);
    const saveFile = (link: string, filename: string, el = document.createElement('a')) => {
        if (!isSNS) {
            el.download = filename;
        }
        el.href = link;
        el.target = '_blank';
        document.body.appendChild(el);
        el.click();
        setTimeout(() => {
            document.body.removeChild(el);
            if (link.startsWith('blob:')) {
                URL.revokeObjectURL(link);
            }
        }, 100);
    };

    return (
        <div className="App flex flex-col justify-between min-h-screen bg-gray-50">
            {/* 横屏提示蒙版 */}
            {isMobile && isPortrait && showOrientationTip && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white"
                    onClick={() => {
                        localStorage.setItem('orientationTipDismissed', 'true');
                        setShowOrientationTip(false)
                    }}
                >
                    <div className="text-center p-6 max-w-xs">
                        <div className="text-4xl mb-6 animate-spin">🔄</div>
                        <h2 className="text-2xl mb-4">{t("please_rotate_to_landscape")}</h2>
                        <p className="opacity-90 mb-2">{t("better_experience_in_landscape")}</p>
                        <p className="text-sm opacity-70 mt-6">{t("click_to_dismiss_continue")}</p>
                    </div>
                </div>
            )}

            <GithubCorner href="https://github.com/KeyPJ/genshin-gacha-banners"/>

            <h1 className="text-2xl font-bold my-4 ml-4 sm:ml-8 md:ml-12">{t(config.gameKey)}</h1>

            <div className="desktop-left-container px-4 sm:px-8 md:px-12">
                <div className="max-w-3xl">
                    <FilterSection
                        itemType={itemType}
                        setItemType={setItemType}
                        rankType={rankType}
                        setRankType={setRankType}
                        weaponType={weaponType}
                        setWeaponType={setWeaponType}
                        elementType={elementType}
                        setElementType={setElementType}
                        version={version}
                        setVersion={setVersion}
                        showGachaVersions={showGachaVersions}
                        setShowGachaVersions={setShowGachaVersions}
                        itemTypeList={config.itemTypeList}
                        rankTypeList={config.rankTypeList}
                        weaponTypeList={weaponTypeList}
                        elementList={elementList}
                        versionList={versionList}
                        gameKey={config.gameKey}
                        reset={reset}
                    />
                </div>
            </div>

            {!isMobile && showScrollNotice && (
                <div className="text-center text-sm text-gray-600 my-2">
                    ❕{t("notice")}❕
                </div>
            )}

            {/* 横幅容器 */}
            <div
                ref={bannerContainerRef}
                className={classNames(
                    "px-4 pt-4",
                    (!isPortrait) ? "overflow-x-auto pb-4" : "",
                    (!isMobile && isPortrait) ? "min-w-full" : ""
                )}
                style={{boxSizing: 'border-box'}}
            >
                {(!data || data.length === 0) ?
                    <div>{t("Loading")}</div>
                    :
                    <BannersShow
                        data={data}
                        rankType={rankType.value.split(",").map(Number)}
                        setRankType={setRankType}
                        weaponType={weaponType.value.split(",")}
                        elementType={elementType.value.split(",")}
                        reset={reset}
                        currentGachaItemId={currentGachaItemId}
                        setCurrentGachaItemId={setCurrentGachaItemId}
                        showGachaVersions={showGachaVersions}
                        setShowGachaVersions={setShowGachaVersions}
                        version={version.value}
                        resetVersion={() => setVersion(versionList[0])}
                        itemType={itemType.value}
                    />}
            </div>

            {/* 移动端横向模式提示 */}
            {isMobile && !isPortrait && data.length > 0 && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                    {t("please_use_portrait_mode_to_save_image")}
                </p>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-4 my-4 px-4">
                <button
                    onClick={saveImage}
                    disabled={isSavingImage || !data.length || (!isPortrait && isMobile)}
                    className={classNames(
                        "px-6 py-2 rounded-md font-medium transition-colors",
                        isSavingImage
                            ? "bg-gray-300 cursor-not-allowed"
                            : !data.length
                                ? "bg-gray-300 cursor-not-allowed"
                                : (!isPortrait && isMobile)
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                    )}
                >
                    {isSavingImage ? t("saving") : t("save")}
                    {saveStatus === "success" && " ✅"}
                    {saveStatus === "error" && " ❌"}
                </button>

                <button
                    onClick={share}
                    disabled={isGeneratingShortUrl || !data.length}
                    className={classNames(
                        "px-6 py-2 rounded-md font-medium transition-colors",
                        isGeneratingShortUrl
                            ? "bg-gray-300 cursor-not-allowed"
                            : !data.length
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                >
                    {isGeneratingShortUrl ? t("sharing") : t("share")}
                    {shareStatus === "success" && " ✅"}
                    {shareStatus === "error" && " ❌"}
                </button>
            </div>

            <div className="text-center space-y-1 mb-2">
                {shareStatus === "success" && (
                    <div className="text-green-600 text-sm">{t("shareSuccess")}</div>
                )}
                {shareStatus === "error" && (
                    <div className="text-red-600 text-sm">{t("shareError")}</div>
                )}
                {saveStatus === "success" && (
                    <div className="text-green-600 text-sm">{t("saveSuccess")}</div>
                )}
                {saveStatus === "error" && (
                    <div className="text-red-600 text-sm">{t("saveError")}</div>
                )}
            </div>

            <div className="flex justify-center items-center gap-4 my-3">
                <span className="text-sm text-gray-600">{t("language")}</span>
                {languageOptions.map(l => (
                    <div
                        key={l.code}
                        className={classNames(
                            "text-sm cursor-pointer px-3 py-1 rounded",
                            language === l.code
                                ? "bg-gray-200 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                        )}
                        onClick={() => changeLanguage(l.code)}
                    >
                        {l.value}
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-6 my-4 flex-wrap px-4">
                <Link
                    to="/"
                    className={classNames("px-4 py-2 rounded",
                        location.pathname === "/" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
                >
                    {t("gi")}
                </Link>
                <Link
                    to="/hsr"
                    className={classNames("px-4 py-2 rounded",
                        location.pathname === "/hsr" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
                >
                    {t("hsr")}
                </Link>
                <Link
                    to="/zzz"
                    className={classNames("px-4 py-2 rounded",
                        location.pathname === "/zzz" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
                >
                    {t("zzz")}
                </Link>
            </div>
            <footer className="flex justify-center bg-gray-100 py-4 mt-6">
                <div className="text-center text-gray-600 text-sm">
                    <a
                        href="https://github.com/KeyPJ/genshin-gacha-banners"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-1 inline-block"
                    >
                        {`© 2022-${new Date().getFullYear()} Genshin Gacha Banners`}
                    </a>
                </div>
            </footer>
        </div>
    )
};

export default withRouter(GamePage);