import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useTranslation} from "react-i18next";

interface IProps {
    data: gachaData[],
    item: Item
    findIndexMax: number
}

const imageBaseUrl = '/api/content?i=';

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const getFindLatestIndex = (data: gachaData[], itemId: number): number => {
    return data.map(gacha => gacha.items.map(i => i.itemId).includes(itemId)).reverse().findIndex(tf => tf);
};

export default function DataRow(props: IProps) {

    const {t} = useTranslation();

    const {data, item, findIndexMax} = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const commonItemId: number[] = [1042, 15502, 11501, 14502, 12502, 15501, 14501, 12501, 13505, 11502, 13502];

    const borderColor = item.rankType == 5 ? "border-amber-500" : "border-purple-500";

    let tempNumber: number = -1;

    const findIndex = getFindLatestIndex(data, item.itemId);

    const pickUpGacha = data[data.length - 1 - findIndex];

    const days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays());

    return (
        <div className={"flex flex-row shrink-0 w-fit"}>
            <div className={classNames(itemClassName, "sticky left-0 bg-white ")}>
                <img src={imageBaseUrl + item.image.url} alt={item.name}
                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
                />
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
            {data.map((gacha) => {
                    const key = `${item.itemId}-${gacha.id}`;
                    if (gacha.items.map(i => i.itemId).includes(item.itemId)) {
                        tempNumber = 0;
                        return (
                            <div key={key}
                                 className={classNames(itemClassName)}>
                                <img src={imageBaseUrl + item.image.url} alt={item.name}
                                     className={classNames(itemClassName, borderColor, "border-solid rounded-[50%]")}
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
