import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { GameConfig } from '../types';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import GithubCorner from 'react-github-corner';
import { classNames } from './Common';
import BannersShow from './BannersShow';
import FilterSection from './FilterSection';
import { useBannerData } from '../hooks/useBannerData';
import { useURLState } from '../hooks/useURLState';
import { useOrientation } from '../hooks/useOrientation';
import { useShareLink } from '../hooks/useShareLink';
import { useImageExport } from '../hooks/useImageExport';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import '../App.css';

interface GamePageProps {
    config: GameConfig;
}

const GamePage = ({ config }: GamePageProps) => {
    const location = useLocation();
    const { t } = useTranslation();

    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, languageOptions } = useLanguage();
    const { state, setters, generateShortCode, resetFilters, weaponTypeList, elementList, versionList } = useURLState(config, t);
    const { data, loading } = useBannerData(config.gameKey, state.itemType.value);
    const { isPortrait, showOrientationTip, showScrollNotice, dismissTip, containerRef } = useOrientation();
    const { share, isGenerating, status: shareStatus } = useShareLink(generateShortCode);
    const { saveImage, isSaving, status: saveStatus } = useImageExport(
        containerRef,
        generateShortCode,
        () => `${config.gameKey}_${state.itemType.value.toLowerCase()}_banners`
    );

    // Game dropdown state
    const [showGameDropdown, setShowGameDropdown] = useState(false);
    const gameDropdownRef = useRef<HTMLDivElement>(null);
    const gameTitleRef = useRef<HTMLHeadingElement>(null);

    // Sync currentGachaVersion -> itemIds
    useEffect(() => {
        if (data.length > 0 && state.currentGachaVersion) {
            const itemIds = data
                .filter(gacha => gacha.version === state.currentGachaVersion)
                .flatMap(i => i.items.map(a => a.itemId));
            if (itemIds.length > 0) {
                setters.setShowGachaVersions([]);
                setters.setCurrentGachaItemId(itemIds);
            } else {
                setters.setCurrentGachaVersion("");
            }
        }
    }, [data, state.currentGachaVersion]);

    // Sync currentGachaItemId -> showGachaVersions
    useEffect(() => {
        if (data.length > 0 && state.currentGachaItemId.length === 1) {
            const targetId = state.currentGachaItemId[0];
            const filteredVersions = data
                .filter(d => d.items.some(gacha => gacha.itemId === targetId))
                .map(item => item.version);
            setters.setShowGachaVersions([...new Set(filteredVersions)]);
        }
    }, [data, state.currentGachaItemId]);

    // Click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                showGameDropdown &&
                gameTitleRef.current &&
                !gameTitleRef.current.contains(event.target as Node) &&
                gameDropdownRef.current &&
                !gameDropdownRef.current.contains(event.target as Node)
            ) {
                setShowGameDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showGameDropdown]);

    const gameNavigations = [
        { path: "/", key: "gi", label: t("gi") },
        { path: "/hsr", key: "hsr", label: t("hsr") },
        { path: "/zzz", key: "zzz", label: t("zzz") },
    ].filter(game => game.key !== config.gameKey);

    const handleItemTypeChange = (opt: typeof state.itemType) => {
        resetFilters();
        setters.setItemType(opt);
        setters.setShowGachaVersions([]);
    };

    const rankTypeValues = state.rankType.value.split(",").map(Number);
    const weaponTypeValues = state.weaponType.value.split(",");
    const elementTypeValues = state.elementType.value.split(",");

    const gameThemeClass = config.gameKey === 'hsr' ? 'hsr-gradient-text' : config.gameKey === 'zzz' ? 'zzz-gradient-text' : 'gi-gradient-text';

    const isDark = theme === 'dark';

    return (
        <div className={classNames(
            "App flex flex-col justify-between min-h-screen transition-colors duration-300",
            isDark ? "bg-slate-950 text-slate-200" : "bg-slate-200 text-slate-700"
        )}>
            {/* Orientation overlay */}
            {isMobile && isPortrait && showOrientationTip && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-white"
                    onClick={dismissTip}
                >
                    <div className="text-center p-6 max-w-xs animate-fade-in">
                        <div className="text-5xl mb-6 animate-spin">{'\u{1F504}'}</div>
                        <h2 className="text-2xl font-bold mb-4">{t("please_rotate_to_landscape")}</h2>
                        <p className="opacity-90 mb-2">{t("better_experience_in_landscape")}</p>
                        <p className="text-sm opacity-60 mt-6">{t("click_to_dismiss_continue")}</p>
                    </div>
                </div>
            )}

            <GithubCorner href="https://github.com/KeyPJ/genshin-gacha-banners" />

            {/* Header row: title + theme toggle + dropdown container */}
            <div className="flex items-center gap-3 ml-4 sm:ml-8 md:ml-12 my-5">
                {/* Game title + dropdown (dropdown outside h1 to avoid gradient-text inheritance) */}
                <div ref={gameTitleRef} className="relative inline-block">
                    <h1
                        className={`text-3xl font-bold cursor-pointer ${gameThemeClass} hover:opacity-80 transition-opacity duration-200 select-none`}
                        onClick={() => setShowGameDropdown(!showGameDropdown)}
                    >
                        {t(config.gameKey)}
                        <span className="ml-2 text-sm opacity-60">{'▼'}</span>
                    </h1>
                    {showGameDropdown && (
                        <div
                            ref={gameDropdownRef}
                            className={classNames(
                                "absolute top-full left-0 mt-2 w-48 rounded-xl shadow-xl py-1 z-40 animate-fade-in border",
                                isDark ? "glass-card-solid border-white/10" : "bg-white border-gray-200"
                            )}
                        >
                            {gameNavigations.map(game => (
                                <Link
                                    key={game.path}
                                    to={game.path}
                                    className={classNames(
                                        "block px-4 py-2.5 text-sm transition-colors",
                                        isDark ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-gray-700 hover:bg-gray-100"
                                    )}
                                    onClick={() => setShowGameDropdown(false)}
                                >
                                    {game.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={classNames(
                        "p-2 rounded-lg transition-all duration-200 text-lg",
                        isDark ? "hover:bg-white/10 text-yellow-400" : "hover:bg-gray-200 text-slate-600"
                    )}
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? '☀️' : '\u{1F319}'}
                </button>
            </div>

            {/* Filters */}
            <div className="desktop-left-container px-4 sm:px-8 md:px-12">
                <div className="max-w-3xl">
                    <FilterSection
                        itemType={state.itemType}
                        setItemType={handleItemTypeChange}
                        rankType={state.rankType}
                        setRankType={setters.setRankType}
                        weaponType={state.weaponType}
                        setWeaponType={setters.setWeaponType}
                        elementType={state.elementType}
                        setElementType={setters.setElementType}
                        version={state.version}
                        setVersion={setters.setVersion}
                        showGachaVersions={state.showGachaVersions}
                        setShowGachaVersions={setters.setShowGachaVersions}
                        itemTypeList={config.itemTypeList}
                        rankTypeList={config.rankTypeList}
                        weaponTypeList={weaponTypeList}
                        elementList={elementList}
                        versionList={versionList}
                        gameKey={config.gameKey}
                        reset={resetFilters}
                    />
                </div>
            </div>

            {/* Scroll notice */}
            {!isMobile && showScrollNotice && (
                <div className={classNames("text-center text-sm my-2 animate-fade-in", isDark ? "text-slate-400" : "text-gray-500")}>
                    {'❕ '}{t("notice")}{' ❕'}
                </div>
            )}

            {/* Banner container */}
            <div
                ref={containerRef}
                className={classNames(
                    "px-4 pt-4",
                    !isPortrait ? "overflow-x-auto pb-4" : "",
                    !isMobile && isPortrait ? "min-w-full" : ""
                )}
                style={{ boxSizing: 'border-box' }}
            >
                {loading || data.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="skeleton w-64 h-8 rounded" />
                            <div className="skeleton w-96 h-64 rounded-xl" />
                            <div className="skeleton w-48 h-4 rounded" />
                        </div>
                    </div>
                ) : (
                    <BannersShow
                        data={data}
                        rankType={rankTypeValues}
                        setRankType={setters.setRankType}
                        weaponType={weaponTypeValues}
                        elementType={elementTypeValues}
                        reset={resetFilters}
                        currentGachaItemId={state.currentGachaItemId}
                        setCurrentGachaItemId={setters.setCurrentGachaItemId}
                        showGachaVersions={state.showGachaVersions}
                        setShowGachaVersions={setters.setShowGachaVersions}
                        version={state.version.value}
                        resetVersion={() => setters.setVersion(versionList[0])}
                        itemType={state.itemType.value}
                        currentGachaVersion={state.currentGachaVersion}
                        setCurrentGachaVersion={setters.setCurrentGachaVersion}
                    />
                )}
            </div>

            {/* Mobile landscape hint */}
            {isMobile && !isPortrait && data.length > 0 && (
                <p className={classNames("text-xs mt-1 text-center", isDark ? "text-slate-500" : "text-gray-400")}>
                    {t("please_use_portrait_mode_to_save_image")}
                </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 my-6 px-4">
                <button
                    onClick={saveImage}
                    disabled={isSaving || !data.length || (!isPortrait && isMobile)}
                    className={classNames(
                        "px-8 py-3 rounded-xl font-semibold transition-all duration-200 text-sm tracking-wide",
                        isSaving || !data.length || (!isPortrait && isMobile)
                            ? isDark ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : `btn-${config.gameKey} shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                    )}
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("saving")}
                        </span>
                    ) : (
                        <>{t("save")} {saveStatus === "success" ? "✓" : saveStatus === "error" ? "✗" : ""}</>
                    )}
                </button>

                <button
                    onClick={share}
                    disabled={isGenerating || !data.length}
                    className={classNames(
                        "px-8 py-3 rounded-xl font-semibold transition-all duration-200 text-sm tracking-wide",
                        isGenerating || !data.length
                            ? isDark ? "bg-slate-700 text-slate-500 cursor-not-allowed" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    )}
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("sharing")}
                        </span>
                    ) : (
                        <>{t("share")} {shareStatus === "success" ? "✓" : shareStatus === "error" ? "✗" : ""}</>
                    )}
                </button>
            </div>

            {/* Status messages */}
            <div className="text-center space-y-1 mb-2">
                {shareStatus === "success" && <div className={classNames("text-sm animate-fade-in", isDark ? "text-emerald-400" : "text-emerald-600")}>{t("shareSuccess")}</div>}
                {shareStatus === "error" && <div className={classNames("text-sm animate-fade-in", isDark ? "text-red-400" : "text-red-600")}>{t("shareError")}</div>}
                {saveStatus === "success" && <div className={classNames("text-sm animate-fade-in", isDark ? "text-emerald-400" : "text-emerald-600")}>{t("saveSuccess")}</div>}
                {saveStatus === "error" && <div className={classNames("text-sm animate-fade-in", isDark ? "text-red-400" : "text-red-600")}>{t("saveError")}</div>}
            </div>

            {/* Language switcher */}
            <div className="flex justify-center items-center gap-3 my-4">
                <span className={classNames("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>{t("language")}</span>
                {languageOptions.map(l => (
                    <div
                        key={l.code}
                        className={classNames(
                            "text-sm cursor-pointer px-4 py-1.5 rounded-full transition-all duration-200",
                            language === l.code
                                ? isDark ? "bg-white/10 text-white font-medium ring-1 ring-white/20" : "bg-gray-200 text-gray-800 font-medium"
                                : isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        )}
                        onClick={() => setLanguage(l.code)}
                    >
                        {l.value}
                    </div>
                ))}
            </div>

            {/* Navigation links */}
            <div className="flex justify-center gap-4 my-5 flex-wrap px-4">
                <Link to="/" className={classNames(
                    "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === "/"
                        ? isDark ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                )}>{t("gi")}</Link>
                <Link to="/hsr" className={classNames(
                    "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === "/hsr"
                        ? isDark ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30" : "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                        : isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                )}>{t("hsr")}</Link>
                <Link to="/zzz" className={classNames(
                    "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === "/zzz"
                        ? isDark ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30" : "bg-red-50 text-red-700 ring-1 ring-red-200"
                        : isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                )}>{t("zzz")}</Link>
            </div>

            {/* Footer */}
            <footer className={classNames("flex justify-center py-5 mt-6", isDark ? "border-t border-white/5" : "border-t border-gray-200")}>
                <div className={classNames("text-center text-sm", isDark ? "text-slate-500" : "text-gray-400")}>
                    <a
                        href="https://github.com/KeyPJ/genshin-gacha-banners"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classNames("hover:underline transition-colors mt-1 inline-block", isDark ? "text-slate-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600")}
                    >
                        {`© 2022-${new Date().getFullYear()} Genshin Gacha Banners`}
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default GamePage;
