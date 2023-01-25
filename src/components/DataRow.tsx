import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useTranslation} from "react-i18next";

interface IProps {
    data: gachaData[],
    item: Item
    findIndexMax: number
    showGachaIndex: number[]
    currentGachaItemId: number[]
    setShowGachaIndex: Function
    setCurrentGachaItemId: Function
}

// const imageBaseUrl = '/api/content?i=';
// const imageBaseUrl = '/content';

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const getFindLatestIndex = (data: gachaData[], itemId: number): number => {
    return data.map(gacha => gacha.items.map(i => i.itemId).includes(itemId)).reverse().findIndex(tf => tf);
};
export default function DataRow(props: IProps) {

    const {t, i18n} = useTranslation();

    const {
        data,
        item,
        findIndexMax,
        showGachaIndex,
        setShowGachaIndex,
        setCurrentGachaItemId,
        currentGachaItemId
    } = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const borderColor = item.rankType == 5 ? "border-amber-500" : "border-purple-500";

    let tempNumber: number = -1;

    const findIndex = getFindLatestIndex(data, item.itemId);

    const pickUpGacha = data[data.length - 1 - findIndex];

    const days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays());

    const handleCharacterClick = (item: Item) => {
        // setRankType({name: t("ALL"), value: "4,5"});

        const gachaIndex = data
            .map((gacha, index) => gacha.items.map(i => i.itemId).includes(item.itemId) ? index : -1)
            .filter(i => i >= 0);

        if (showGachaIndex.toString() == gachaIndex.toString()) {
            setShowGachaIndex([])
            setCurrentGachaItemId([])
        } else {
            setShowGachaIndex(gachaIndex)
            setCurrentGachaItemId([item.itemId]);
        }


    }

    const showIndex = showGachaIndex
        .map((n, index) => index == 0 ? [n] : [n, n - 1])
        .reduce((a, b) => a.concat(b), [])
        .filter(i => i >= 0)
        .concat(data.length - 1);


    const commonItemName = [
        //角色
        "刻晴",
        "提纳里",
        //五星武器
        "阿莫斯之弓", "天空之翼",
        "四风原典", "天空之卷",
        "和璞鸢", "天空之脊",
        "狼的末路", "天空之傲",
        "天空之刃", "风鹰剑",
        //四星武器
        "弓藏",
        "祭礼弓",
        "绝弦",
        "西风猎弓",
        "昭心",
        "祭礼残章",
        "流浪乐章",
        "西风秘典",
        "西风长枪",
        "匣里灭辰",
        "雨裁",
        "祭礼大剑",
        "钟剑",
        "西风大剑",
        "匣里龙吟",
        "祭礼剑",
        "笛剑",
        "西风剑"
    ]

    const isPermanent = (item: Item) => {
        if (item.itemType == "Character") {
            if (item.rankType == 5) {
                return commonItemName.includes(item.name);
            }
        }
        if (item.itemType == "Weapon") {
            return commonItemName.includes(item.name);
        }
        return true;
    };

    const numbers: number[] = data.map(gacha => gacha.items)
        .filter(items => items.map(i => i.itemId).includes(item.itemId))
        .map(items => items.length);

    const pickUpGachaItemSizeMax = Math.max(...numbers);

    console.log("pickUpGachaItemSizeMax", pickUpGachaItemSizeMax);

    const pickUpGachaItem = currentGachaItemId.length != 1 ? [] : [...Array(pickUpGachaItemSizeMax - 1)].map((v, i) =>
        <div className={"flex flex-row shrink-0 w-fit"}>
            <div className={classNames(itemClassName, "sticky left-0 bg-white ")}>
            </div>
            <div
                className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs whitespace-pre-line")}>
                <div>
                </div>
            </div>
            {data.map((gacha, index) => {
                    const key = `${item.itemId}-${gacha.version}`;
                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        if (showGachaIndex.length > 0 && !showIndex.includes(index)) {
                            return <div key={key}/>
                        }
                        const pickUpitems = gacha.items.filter(i => i.itemId != item.itemId);
                        if (pickUpitems.length < i) {
                            return <div key={key}
                                        className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                            >
                            </div>
                        }
                        const showItem = pickUpitems[i];
                        console.log("showItem", showItem);
                        if (!showItem) {
                            return <div key={key}
                                        className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                            >
                            </div>
                        }
                        const borderColor = showItem.rankType == 5 ? "border-amber-500" : "border-purple-500";
                        return (
                            <div key={key}
                                 className={classNames(itemClassName)}>
                                <img src={showItem.imageUrl}
                                     alt={"zh-CN" == i18n.language ? showItem.name : showItem.nameEn}
                                     title={"zh-CN" == i18n.language ? showItem.name : showItem.nameEn}
                                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                                     onClick={() => handleCharacterClick(showItem)}
                                />
                            </div>
                        )
                    } else {
                        if (showGachaIndex.length > 0 && !showIndex.includes(index)) {
                            return <div/>
                        }
                        return <div key={key}
                                    className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                        >
                        </div>
                    }
                }
            )}
        </div>
    )

    return (
        [<div className={"flex flex-row shrink-0 w-fit"}>
            <div className={classNames(itemClassName, "sticky left-0 bg-white ")}>
                <img src={item.imageUrl} alt={"zh-CN" == i18n.language ? item.name : item.nameEn}
                     title={"zh-CN" == i18n.language ? item.name : item.nameEn}
                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                     onClick={() => handleCharacterClick(item)}
                />
            </div>
            <div
                className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs whitespace-pre-line")}>
                <div>
                    {isPermanent(item) && <>{t("permanent")}<br/></>}
                    {findIndex == 0 ? t("pickUp") : t("sinceLastPickUp", {findIndex, days})}
                </div>
            </div>
            {data.map((gacha, index) => {
                    const key = `${item.itemId}-${gacha.version}`;
                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        if (showGachaIndex.length > 0 && !showIndex.includes(index)) {
                            return <div key={key}/>
                        }
                        return (
                            <div key={key}
                                 className={classNames(itemClassName)}>
                                <img src={item.imageUrl} alt={"zh-CN" == i18n.language ? item.name : item.nameEn}
                                     title={"zh-CN" == i18n.language ? item.name : item.nameEn}
                                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                                     onClick={() => handleCharacterClick(item)}
                                />
                            </div>
                        )
                    } else {
                        tempNumber = tempNumber >= 0 ? tempNumber + 1 : tempNumber;

                        let style = {};
                        if (tempNumber > 0) {
                            let to = 255 - 255 / findIndexMax * tempNumber;
                            let from = 255 - 255 / findIndexMax * (tempNumber + 1);
                            style = {backgroundImage: `linear-gradient(to right, rgb(${from}, ${from}, 255) , rgb(${to}, ${to}, 255))`}
                        }

                        if (showGachaIndex.length > 0 && !showIndex.includes(index)) {
                            return <div/>
                        }
                        return <div key={key}
                                    className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                                    style={style}
                        >
                            {tempNumber > 0 ? tempNumber : ""}
                        </div>;
                    }
                }
            )}
        </div>,
            ...pickUpGachaItem
        ]
    )
}
