import { gachaData } from "genshin-wishes";
import { Option } from "../types";
import { useTranslation } from "react-i18next";
import { classNames, dateFormat, getIndexByVersion } from "./Common";

interface IProps {
    rankType: number[];
    setRankType: (option: Option) => void;
    data: gachaData[];
    currentGachaItemId: number[];
    setCurrentGachaItemId: (ids: number[]) => void;
    sortB: number;
    setSortB: (value: number) => void;
    showGachaVersions: string[];
    setShowGachaVersions: (versions: string[]) => void;
    version?: string;
    currentGachaVersion: string;
    setCurrentGachaVersion: (version: string) => void;
}

export default function FirstRow(props: IProps) {
    const { t } = useTranslation();
    const {
        setRankType,
        data,
        currentGachaItemId,
        setCurrentGachaItemId,
        sortB,
        setSortB,
        showGachaVersions = [],
        setShowGachaVersions,
        version,
        currentGachaVersion,
        setCurrentGachaVersion,
    } = props;

    const itemClassName = "border-2 border-gray-200 dark:border-white/10 w-20 h-20 shrink-0";

    const handleGachaClick = (gachaVersion: string, itemIds: number[]) => {
        setRankType({ name: t("ALL"), value: "4,5" } as Option);
        setCurrentGachaItemId(itemIds.toString() === currentGachaItemId.toString() ? [] : itemIds);
        setShowGachaVersions([]);
        setCurrentGachaVersion(currentGachaVersion === gachaVersion ? "" : gachaVersion);
    };

    const showIndex = showGachaVersions
        ?.map(version => getIndexByVersion(data, version))
        .filter(index => index !== -1)
        .map((n, index) => index === 0 ? [n] : [n, n - 1])
        .reduce((a, b) => a.concat(b), [])
        .filter(i => i >= 0)
        .concat(data.length - 1);

    return (
        <div className="flex flex-row shrink-0 w-fit h-fit sticky top-0 z-20">
            <div
                className={classNames(itemClassName, "sticky left-0 bg-white dark:bg-slate-900 z-10 text-xs text-gray-500 dark:text-slate-400 whitespace-pre-line cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors")}
                onClick={() => {
                    setSortB(1);
                    setCurrentGachaItemId([]);
                    setShowGachaVersions([]);
                }}
            >
                {t("rowClick")}
            </div>
            <div
                className={classNames(itemClassName, "sticky left-20 bg-white dark:bg-slate-900 z-10 text-xs text-gray-500 dark:text-slate-400 whitespace-pre-line cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors")}
                onClick={() => setSortB(sortB === 0 ? 1 : 0)}
            >
                {sortB === 0 ? t("unavailable") : t("release")}
            </div>
            {data.map((gacha, index) => {
                const { version: gachaVersion, start, end } = gacha;
                const key = `0-${gachaVersion}`;
                const showGacha = showGachaVersions.length > 0 && !showGachaVersions.includes(gachaVersion);
                const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                if (showGacha || showVersion) {
                    return <div key={key} className={showIndex.includes(index) && !showVersion ? itemClassName : ""} />;
                }

                const isActive = gacha.items.map(i => i.itemId).toString() === currentGachaItemId.toString();

                return (
                    <div
                        key={key}
                        className={classNames(
                            itemClassName,
                            "text-center text-xs cursor-pointer transition-colors",
                            "text-gray-800 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700/50",
                            isActive ? "ring-2 ring-amber-500/70 star-5-glow" : ""
                        )}
                        onClick={() => handleGachaClick(gachaVersion, gacha.items.map(i => i.itemId))}
                    >
                        <div className="text-gray-800 dark:text-amber-400 font-semibold">{gachaVersion}</div>
                        <div className="text-gray-400 dark:text-slate-500 text-[10px]">{dateFormat(start)}</div>
                        <div className="text-gray-400 dark:text-slate-500 text-[10px]">{dateFormat(end)}</div>
                    </div>
                );
            })}
        </div>
    );
}
