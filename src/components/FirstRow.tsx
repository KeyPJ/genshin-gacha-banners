import {gachaData} from "genshin-wishes";
import moment from "moment";
import {useTranslation} from "react-i18next";

interface IProps {
    rankType: number[],
    setRankType: Function
    data: gachaData[],
    currentGachaItemId: number[],
    setCurrentGachaItemId: Function;
    sortB: number
    setSortB: Function
    showGachaIndex: number[]
    setShowGachaIndex: Function
}

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const dateFormat = (start: string) => moment(start).format("YYYYMMDD");

export default function FirstRow(props: IProps) {

    const {t} = useTranslation();

    const {
        setRankType,
        data,
        currentGachaItemId,
        setCurrentGachaItemId,
        sortB,
        setSortB,
        showGachaIndex,
        setShowGachaIndex
    } = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const handleGachaClick = (itemIds: number[]) => {
        setRankType({name: t("ALL"), value: "4,5"});
        setCurrentGachaItemId(itemIds.toString() == currentGachaItemId.toString() ? [] : itemIds)
        setShowGachaIndex([])
    }

    return (
        <div className={"flex flex-row shrink-0 w-fit h-fit sticky top-0"}>
            <div
                className={classNames(itemClassName, "sticky left-0 bg-white z-10 text-sm whitespace-pre-line")}
                onClick={
                    () => {
                        setSortB(1);
                        setCurrentGachaItemId([])
                        setShowGachaIndex([])
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
            {data.map((gacha, index) => {
                    let {start, end} = gacha;
                    if (showGachaIndex.length > 0 && !showGachaIndex.concat(data.length-1).includes(index)) {
                        return <div/>
                    }
                    return (

                        <div key={`0-${gacha.id}`}
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
    )
}
