import { gachaData, Item } from "genshin-wishes";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { classNames, getFindLatestIndex, getIndexByVersion } from "./Common";
import { Fragment } from "react";

interface IProps {
    data: gachaData[];
    item: Item;
    findIndexMax: number;
    showGachaVersions: string[];
    currentGachaItemId: number[];
    setShowGachaVersions: (versions: string[]) => void;
    setCurrentGachaItemId: (ids: number[]) => void;
    version?: string;
    resetVersion?: () => void;
    setCurrentGachaVersion: (version: string) => void;
}

const COMMON_ITEM_NAMES = [
    "刻晴", "提纳里", "迪希雅",
    "阿莫斯之弓", "天空之翼", "四风原典", "天空之卷",
    "和璞鸢", "天空之脊", "狼的末路", "天空之傲", "天空之刃", "风鹰剑",
    "弓藏", "祭礼弓", "绝弦", "西风猎弓", "昭心", "祭礼残章",
    "流浪乐章", "西风秘典", "西风长枪", "匣里灭辰", "雨裁",
    "祭礼大剑", "钟剑", "西风大剑", "匣里龙吟", "祭礼剑", "笛剑", "西风剑"
];

export default function DataRow(props: IProps) {
    const { t } = useTranslation();
    const {
        data, item, findIndexMax,
        showGachaVersions, setShowGachaVersions,
        setCurrentGachaItemId, currentGachaItemId,
        version, resetVersion, setCurrentGachaVersion,
    } = props;

    const itemClassName = "border-2 border-gray-200 dark:border-white/10 w-20 h-20 shrink-0";
    const borderColor = item.rankType === 5 ? "border-amber-500/80" : "border-purple-500/80";
    const glowClass = item.rankType === 5 ? "star-5-glow" : "star-4-glow";

    let tempNumber = -1;
    const findIndex = getFindLatestIndex(data, item.itemId);
    const pickUpGacha = data[data.length - 1 - findIndex];
    const days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha?.end))).asDays());

    const handleCharacterClick = (clickedItem: Item) => {
        const gachaVersions = data
            .filter(gacha => gacha.items.map(i => i.itemId).includes(clickedItem.itemId))
            .map(gacha => gacha.version);

        if (showGachaVersions.toString() === gachaVersions.toString()) {
            setShowGachaVersions([]);
            setCurrentGachaItemId([]);
        } else {
            setShowGachaVersions(gachaVersions || []);
            setCurrentGachaItemId([clickedItem.itemId]);
        }
        setCurrentGachaVersion("");
        resetVersion?.();
    };

    const showIndex = showGachaVersions
        ?.map(version => getIndexByVersion(data, version))
        .filter(index => index !== -1)
        .map((n, index) => index === 0 ? [n] : [n, n - 1])
        .reduce((a, b) => a.concat(b), [])
        .filter(i => i >= 0)
        .concat(data.length - 1);

    const isPermanent = (checkItem: Item) => {
        if (checkItem.itemType === "Character") {
            return checkItem.rankType === 5 ? COMMON_ITEM_NAMES.includes(checkItem.name) : false;
        }
        if (checkItem.itemType === "Weapon") {
            return COMMON_ITEM_NAMES.includes(checkItem.name);
        }
        return true;
    };

    const numbers: number[] = data.map(gacha => gacha.items)
        .filter(items => items.map(i => i.itemId).includes(item.itemId))
        .map(items => items.length);

    const pickUpGachaItemSizeMax = Math.max(...numbers);

    const renderPickUpCell = (showItem: Item, key: string) => {
        const cellBorderColor = showItem.rankType === 5 ? "border-amber-500/60" : "border-purple-500/60";
        return (
            <div key={key} className={classNames(itemClassName)}>
                <img
                    src={showItem.imageUrl}
                    alt={showItem.name}
                    title={showItem.name}
                    className={classNames(itemClassName, cellBorderColor, "rounded-full cursor-pointer hover:scale-110 transition-transform")}
                    onClick={() => handleCharacterClick(showItem)}
                />
            </div>
        );
    };

    const pickUpGachaItem = currentGachaItemId.length !== 1 ? [] :
        [...Array(pickUpGachaItemSizeMax - 1)].map((_, i) => (
            <div key={`pickup-${i}`} className="flex flex-row shrink-0 w-fit">
                <div className={classNames(itemClassName, "sticky left-0 bg-white dark:bg-slate-900")} />
                <div className={classNames(itemClassName, "sticky left-20 bg-white dark:bg-slate-900 z-10 text-xs whitespace-pre-line")} />
                {data.map((gacha, index) => {
                    const { version: gachaVersion } = gacha;
                    const key = `${item.itemId}-${gachaVersion}-${i}`;
                    const showGacha = showGachaVersions.length > 0 && !showIndex.includes(index);
                    const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                    if (gacha.items.map(g => g.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        if (showGacha || showVersion) return <div key={key} />;

                        const pickUpitems = gacha.items.filter(g => g.itemId !== item.itemId);
                        if (pickUpitems.length <= i) {
                            return <div key={key} className={classNames(itemClassName, "text-3xl font-bold leading-loose text-gray-300 dark:text-slate-600")} />;
                        }

                        const showItem = pickUpitems[i];
                        if (!showItem) {
                            return <div key={key} className={classNames(itemClassName, "text-3xl font-bold leading-loose text-gray-300 dark:text-slate-600")} />;
                        }

                        return renderPickUpCell(showItem, key);
                    } else {
                        if (showGacha || showVersion) return <div key={key} />;
                        return <div key={key} className={classNames(itemClassName, "text-3xl font-bold leading-loose text-gray-300 dark:text-slate-600")} />;
                    }
                })}
            </div>
        ));

    return (
        <Fragment>
            {[
                <div key="main-row" className="flex flex-row shrink-0 w-fit">
                    <div className={classNames(itemClassName, "sticky left-0 bg-white dark:bg-slate-900")}>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            title={item.name}
                            className={classNames(itemClassName, borderColor, glowClass, "rounded-full cursor-pointer hover:scale-110 transition-transform")}
                            onClick={() => handleCharacterClick(item)}
                        />
                    </div>
                    <div className={classNames(itemClassName, "sticky left-20 bg-white dark:bg-slate-900 z-10 text-xs text-gray-500 dark:text-slate-400 whitespace-pre-line")}>
                        {isPermanent(item) && <span className="text-amber-500">{t("permanent")}<br /></span>}
                        {findIndex === 0 ? (
                            <span className="text-emerald-400">{t("pickUp")}</span>
                        ) : (
                            t("sinceLastPickUp", { findIndex, days })
                        )}
                    </div>
                    {data.map((gacha, index) => {
                        const { version: gachaVersion } = gacha;
                        const key = `${item.itemId}-${gachaVersion}-main`;
                        const showGacha = showGachaVersions.length > 0 && !showIndex.includes(index);
                        const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                        if (gacha.items.map(g => g.itemId).includes(item.itemId)) {
                            tempNumber = 0;
                            if (showGacha || showVersion) return <div key={key} />;

                            return (
                                <div key={key} className={classNames(itemClassName)}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        title={item.name}
                                        className={classNames(itemClassName, borderColor, glowClass, "rounded-full cursor-pointer hover:scale-110 transition-transform")}
                                        onClick={() => handleCharacterClick(item)}
                                    />
                                </div>
                            );
                        } else {
                            tempNumber = tempNumber >= 0 ? tempNumber + 1 : tempNumber;
                            const ratio = tempNumber / (findIndexMax || 1);
                            const style = tempNumber > 0 ? {
                                backgroundImage: `linear-gradient(to right,
                                    rgb(calc(var(--grad-start-r) + (var(--grad-end-r) - var(--grad-start-r)) * ${Math.min(ratio + 1 / findIndexMax, 1)}),
                                        calc(var(--grad-start-g) + (var(--grad-end-g) - var(--grad-start-g)) * ${Math.min(ratio + 1 / findIndexMax, 1)}),
                                        calc(var(--grad-start-b) + (var(--grad-end-b) - var(--grad-start-b)) * ${Math.min(ratio + 1 / findIndexMax, 1)})),
                                    rgb(calc(var(--grad-start-r) + (var(--grad-end-r) - var(--grad-start-r)) * ${ratio}),
                                        calc(var(--grad-start-g) + (var(--grad-end-g) - var(--grad-start-g)) * ${ratio}),
                                        calc(var(--grad-start-b) + (var(--grad-end-b) - var(--grad-start-b)) * ${ratio}))
                                )`
                            } : {};

                            if (showGacha || showVersion) return <div key={key} />;

                            return (
                                <div
                                    key={key}
                                    className={classNames(itemClassName, "text-xl font-bold flex items-center justify-center text-gray-600 dark:text-slate-300")}
                                    style={style}
                                >
                                    {tempNumber > 0 ? tempNumber : ""}
                                </div>
                            );
                        }
                    })}
                </div>,
                ...pickUpGachaItem
            ]}
        </Fragment>
    );
}
