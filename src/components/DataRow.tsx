import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useTranslation} from "react-i18next";
import {classNames, getFindLatestIndex, getIndexByVersion} from "./Common";
import {Fragment} from "react";

interface IProps {
    data: gachaData[],
    item: Item,
    findIndexMax: number,
    showGachaVersions: string[],  // 改为存储版本号
    currentGachaItemId: number[],
    setShowGachaVersions: Function,  // 对应修改
    setCurrentGachaItemId: Function,
    version?: string,
    resetVersion?: Function
    setCurrentGachaVersion: Function
}

// 常驻物品列表（提取为常量）
const COMMON_ITEM_NAMES = [
    // 角色
    "刻晴", "提纳里", "迪希雅",
    // 五星武器
    "阿莫斯之弓", "天空之翼", "四风原典", "天空之卷",
    "和璞鸢", "天空之脊", "狼的末路", "天空之傲", "天空之刃", "风鹰剑",
    // 四星武器
    "弓藏", "祭礼弓", "绝弦", "西风猎弓", "昭心", "祭礼残章",
    "流浪乐章", "西风秘典", "西风长枪", "匣里灭辰", "雨裁",
    "祭礼大剑", "钟剑", "西风大剑", "匣里龙吟", "祭礼剑", "笛剑", "西风剑"
];

export default function DataRow(props: IProps) {
    const {t} = useTranslation();
    const {
        data,
        item,
        findIndexMax,
        showGachaVersions,
        setShowGachaVersions,
        setCurrentGachaItemId,
        currentGachaItemId,
        version,
        resetVersion,
        setCurrentGachaVersion,
    } = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";
    const borderColor = item.rankType === 5 ? "border-amber-500" : "border-purple-500";
    let tempNumber: number = -1;
    const findIndex = getFindLatestIndex(data, item.itemId);
    const pickUpGacha = data[data.length - 1 - findIndex];
    const days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha?.end))).asDays());

    const handleCharacterClick = (item: Item) => {
        // 获取包含当前物品的卡池版本号
        const gachaVersions = data
            .filter(gacha => gacha.items.map(i => i.itemId).includes(item.itemId))
            .map(gacha => gacha.version);  // 直接获取版本号

        if (showGachaVersions.toString() === gachaVersions.toString()) {
            setShowGachaVersions([]);
            setCurrentGachaItemId([]);
        } else {
            setShowGachaVersions(gachaVersions || []);  // 存储版本号数组
            setCurrentGachaItemId([item.itemId]);
        }
        setCurrentGachaVersion("")
        // @ts-ignore
        resetVersion?.();
    };

    // 基于版本号计算需要显示的索引
    const showIndex = showGachaVersions
        ?.map(version => getIndexByVersion(data, version))  // 版本转索引
        .filter(index => index !== -1)
        .map((n, index) => index === 0 ? [n] : [n, n - 1])
        .reduce((a, b) => a.concat(b), [])
        .filter(i => i >= 0)
        .concat(data.length - 1);

    const isPermanent = (item: Item) => {
        if (item.itemType === "Character") {
            return item.rankType === 5 ? COMMON_ITEM_NAMES.includes(item.name) : false;
        }
        if (item.itemType === "Weapon") {
            return COMMON_ITEM_NAMES.includes(item.name);
        }
        return true;
    };

    const numbers: number[] = data.map(gacha => gacha.items)
        .filter(items => items.map(i => i.itemId).includes(item.itemId))
        .map(items => items.length);

    const pickUpGachaItemSizeMax = Math.max(...numbers);

    const pickUpGachaItem = currentGachaItemId.length !== 1 ? [] :
        [...Array(pickUpGachaItemSizeMax - 1)].map((_, i) => (
            <div key={`pickup-${i}`} className={"flex flex-row shrink-0 w-fit"}>
                <div className={classNames(itemClassName, "sticky left-0 bg-white")}/>
                <div className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs whitespace-pre-line")}/>
                {data.map((gacha, index) => {
                    const {version: gachaVersion} = gacha;
                    const key = `${item.itemId}-${gachaVersion}-${i}`;
                    const showGacha = showGachaVersions.length > 0 && !showIndex.includes(index);
                    const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        if (showGacha || showVersion) return <div key={key}/>;

                        const pickUpitems = gacha.items.filter(i => i.itemId !== item.itemId);
                        if (pickUpitems.length <= i) {
                            return <div key={key}
                                        className={classNames(itemClassName, "text-3xl font-bold leading-loose")}/>;
                        }

                        const showItem = pickUpitems[i];
                        if (!showItem) {
                            return <div key={key}
                                        className={classNames(itemClassName, "text-3xl font-bold leading-loose")}/>;
                        }

                        const borderColor = showItem.rankType === 5 ? "border-amber-500" : "border-purple-500";
                        return (
                            <div key={key} className={classNames(itemClassName)}>
                                <img
                                    src={showItem.imageUrl}
                                    alt={showItem.name}
                                    title={showItem.name}
                                    className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                                    onClick={() => handleCharacterClick(showItem)}
                                />
                            </div>
                        );
                    } else {
                        if (showGacha || showVersion) return <div key={key}/>;
                        return <div key={key}
                                    className={classNames(itemClassName, "text-3xl font-bold leading-loose")}/>;
                    }
                })}
            </div>
        ));

    return (<Fragment>
            {[
                <div key="main-row" className={"flex flex-row shrink-0 w-fit"}>
                    <div className={classNames(itemClassName, "sticky left-0 bg-white")}>
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            title={item.name}
                            className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                            onClick={() => handleCharacterClick(item)}
                        />
                    </div>
                    <div
                        className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs whitespace-pre-line")}>
                        {isPermanent(item) && <>{t("permanent")}<br/></>}
                        {findIndex === 0 ? t("pickUp") : t("sinceLastPickUp", {findIndex, days})}
                    </div>
                    {data.map((gacha, index) => {
                        const {version: gachaVersion} = gacha;
                        const key = `${item.itemId}-${gachaVersion}-main`;
                        const showGacha = showGachaVersions.length > 0 && !showIndex.includes(index);
                        const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                        if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                            tempNumber = 0;
                            if (showGacha || showVersion) return <div key={key}/>;

                            return (
                                <div key={key} className={classNames(itemClassName)}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        title={item.name}
                                        className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                                        onClick={() => handleCharacterClick(item)}
                                    />
                                </div>
                            );
                        } else {
                            tempNumber = tempNumber >= 0 ? tempNumber + 1 : tempNumber;
                            const style = tempNumber > 0 ? {
                                backgroundImage: `linear-gradient(to right, 
                rgb(${255 - 255 / findIndexMax * (tempNumber + 1)}, ${255 - 255 / findIndexMax * (tempNumber + 1)}, 255), 
                rgb(${255 - 255 / findIndexMax * tempNumber}, ${255 - 255 / findIndexMax * tempNumber}, 255)
              )`
                            } : {};

                            if (showGacha || showVersion) return <div key={key}/>;

                            return (
                                <div
                                    key={key}
                                    className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                                    style={style}
                                >
                                    {tempNumber > 0 ? tempNumber : ""}
                                </div>
                            );
                        }
                    })}
                </div>,
                ...pickUpGachaItem
            ]}</Fragment>
    );
};
