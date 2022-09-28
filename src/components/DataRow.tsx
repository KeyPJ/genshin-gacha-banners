import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useTranslation} from "react-i18next";
import genshindb, {Character, Weapon} from "genshin-db";

interface IProps {
    data: gachaData[],
    item: Item
    findIndexMax: number
    showGachaIndex: number[]
    setShowGachaIndex: Function
    setCurrentGachaItemId: Function
    commonItemId: number[]
}

// const imageBaseUrl = '/api/content?i=';
// const imageBaseUrl = '/content';

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const getFindLatestIndex = (data: gachaData[], itemId: number): number => {
    return data.map(gacha => gacha.items.map(i => i.itemId).includes(itemId)).reverse().findIndex(tf => tf);
};

const getImageUrl = (name: string, itemType: string) => {
    if (itemType == "Character") {
        const {images: {icon: icon}} = genshindb.characters(name) as Character || {images: {icon: ""}}
        if (icon) {
            return icon.replace("https://upload-os-bbs.mihoyo.com/", "");
        }
    } else if (itemType == "Weapon") {
        const {images: {icon}} = genshindb.weapons(name) as Weapon || {images: {icon: ""}}
        return icon.replace("https://upload-os-bbs.mihoyo.com/", "");
    }
    return "";
}

export default function DataRow(props: IProps) {

    const {t} = useTranslation();

    const {data, item, findIndexMax, showGachaIndex, setShowGachaIndex, setCurrentGachaItemId, commonItemId} = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const borderColor = item.rankType == 5 ? "border-amber-500" : "border-purple-500";

    let tempNumber: number = -1;

    const findIndex = getFindLatestIndex(data, item.itemId);

    const pickUpGacha = data[data.length - 1 - findIndex];

    const days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays());

    const handleCharacterClick = () => {
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


    const isPermanent = (item: Item) => {
        if (item.itemType == "Character") {
            if (item.rankType == 5) {
                return commonItemId.includes(item.itemId);
            }
        }
        if (item.itemType == "Weapon") {
            return commonItemId.includes(item.itemId);
        }
        return true;
    };

    return (
        <div className={"flex flex-row shrink-0 w-fit"}>
            <div className={classNames(itemClassName, "sticky left-0 bg-white ")}>
                <img src={getImageUrl(item.name, item.itemType)} alt={item.name}
                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                     onClick={() => handleCharacterClick()}
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
                    const key = `${item.itemId}-${gacha.id}`;
                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        if (showGachaIndex.length > 0 && !showIndex.includes(index)) {
                            return <div key={key}/>
                        }
                        return (
                            <div key={key}
                                 className={classNames(itemClassName)}>
                                <img src={getImageUrl(item.name, item.itemType)} alt={item.name}
                                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                                     onClick={() => handleCharacterClick()}
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
        </div>
    )
}
