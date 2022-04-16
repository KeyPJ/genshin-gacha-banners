import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useState} from "react";
import {useTranslation} from "react-i18next";

interface IProps {
    rankType: number[],
    setRankType: Function
    data: gachaData[],
    currentGachaItemId: number[],
    setCurrentGachaItemId: Function;

}

const imageBaseUrl = '/api/content?i=';

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const dateFormat = (start: string) => moment(start).format("YYYYMMDD");

export default function BannersShow(props: IProps) {

    const {t} = useTranslation();

    const {rankType, setRankType, data, currentGachaItemId, setCurrentGachaItemId} = props;

    const [sortB, setSortB] = useState(1);

    const columnItems: Item[] = data.map(a => a.items).reduce(
        (accumulator, current) => {
            for (let currentElement of current) {
                accumulator = accumulator.map(a => a.itemId).includes(currentElement.itemId) ? accumulator : accumulator.concat(currentElement);
            }
            return accumulator
        }, []
    ).filter(item => rankType.includes(item.rankType))
        .sort((a, b) => {
            let findIndexA = data.map(gacha => gacha.items.map(i => i.itemId).includes(a.itemId)).reverse().findIndex(i => i);
            let findIndexB = data.map(gacha => gacha.items.map(i => i.itemId).includes(b.itemId)).reverse().findIndex(i => i);
            return sortB || findIndexB == 0 ? 1 : findIndexA == 0 ? -1 : findIndexB - findIndexA;
        })
        .filter(item => currentGachaItemId.length == 0 || currentGachaItemId.includes(item.itemId))
        .sort((b, a) => a.rankType - b.rankType)

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const commonItemId: number[] = [1042, 15502, 11501, 14502, 12502, 15501, 14501, 12501, 13505, 11502, 13502];

    const numbers = data.map(a => a.items.map(i => i.itemId).join(",")).join(",").split(",").map(
        id => data.map(gacha => gacha.items.map(i => i.itemId).includes(+id)).reverse().findIndex(b => b)
    );

    const findIndexMax = Math.max(...numbers);

    const handleGachaClick = (itemIds: number[]) => {
        setRankType({name: t("ALL"), value: "4,5"});
        setCurrentGachaItemId(itemIds.toString() == currentGachaItemId.toString() ? [] : itemIds)
    }

    return (
        <div className="text-center flex flex-col min-w-screen h-fit overflow-x-auto overflow-hidden overscroll-x-auto">
            {columnItems.length > 0 && columnItems.slice(-1).concat(columnItems)
                .map((item, index) => {
                    if (index == 0) {
                        return <div key={index} className={"flex flex-row shrink-0 w-fit h-fit"}>
                            <div
                                className={classNames(itemClassName, "sticky left-0 bg-white z-10 text-sm whitespace-pre-line")}
                                onClick={
                                    () => {
                                        setSortB(1);
                                        setCurrentGachaItemId([])
                                    }
                                }
                            >
                                {t("rowClick")}
                            </div>
                            <div
                                className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-sm whitespace-pre-line")}
                                onClick={
                                    () => setSortB(sortB == 0 ? 1 : 0)
                                }>
                                {sortB == 0 ? t("unavailable") : t("release")}
                            </div>
                            {data.map(gacha => {
                                    let [start, end] = gacha.startEndByRegion.ASIA;
                                    return (
                                        <div key={`${index}-${gacha.id}`}
                                             className={classNames(itemClassName, "text-center text-sm cursor-pointer", gacha.items.map(i => i.itemId).toString() == currentGachaItemId.toString() ? "ring-2 border-indigo-500" : "")}
                                             onClick={() => handleGachaClick(gacha.items.map(i => i.itemId))}
                                        >
                                            {gacha.version}<br/>
                                            {dateFormat(start)}<br/>
                                            {dateFormat(end)}<br/>
                                            {/*<img src={imageBaseUrl + gacha.image.url} alt={gacha.version}*/}
                                            {/*     className={classNames("border-solid rounded-1 hover:fixed hover:inset-x-0 hover:m-auto hover:z-20")}/>*/}
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    }
                    const borderColor = item.rankType == 5 ? "border-amber-500" : "border-purple-500";
                    let tempNumber: number = -1;
                    let findIndex = data.map(gacha => gacha.items.map(i => i.itemId).includes(item.itemId)).reverse().findIndex(b => b);
                    let pickUpGacha = data[data.length - 1 - findIndex];
                    let days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays());
                    return (<div key={index} className={"flex flex-row shrink-0 w-fit"}>
                            <div className={classNames(itemClassName, "sticky left-0 bg-white ")}>
                                <img src={imageBaseUrl + item.image.url} alt={item.name}
                                     className={`${itemClassName} ${borderColor} border-solid rounded-[50%]`}/>
                            </div>
                            <div
                                className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs whitespace-pre-line")}>
                                {
                                    item.rankType == 5 && !commonItemId.includes(item.itemId) ?
                                        (findIndex == 0 ? <div>{t("pickUp")}</div> :
                                            <div>
                                                {t("sinceLastPickUp", {findIndex, days})}
                                            </div>)
                                        : (findIndex == 0 ? <div>
                                            {t("permanent")}<br/>
                                            {t("pickUp")}
                                        </div> :
                                        <div>
                                            {t("permanent")}<br/>
                                            {t("sinceLastPickUp", {findIndex, days})}
                                        </div>)
                                }
                            </div>
                            {data.map(gacha => {
                                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                                        tempNumber = 0;
                                        return (
                                            <div key={`${item.itemId}-${gacha.id}`}
                                                 className={classNames(itemClassName)}>
                                                <img src={imageBaseUrl + item.image.url} alt={item.name}
                                                     className={`${itemClassName} ${borderColor} border-solid rounded-[50%]`}/>
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

                                        return <div key={`${item.itemId}-${gacha.id}`}
                                                    className={classNames(itemClassName, "text-3xl font-bold leading-loose")}
                                                    style={style}
                                        >
                                            {tempNumber > 0 ? tempNumber : ""}
                                        </div>;
                                    }
                                }
                            )}
                        </div>
                    )
                })
            }
        </div>
    )
}
