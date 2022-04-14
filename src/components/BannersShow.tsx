import {gachaData, Item} from "genshin-wishes";
import moment from "moment";
import {useState} from "react";

interface IProps {
    itemType: string,
    rankType: number,
    data: gachaData[]
}

const imageBaseUrl = '/api/content?i=';

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

export default function BannersShow(props: IProps) {

    const {itemType, rankType, data} = props;

    const [sortB, setSortB] = useState(1);

    const columnItems: Item[] = data.map(a => a.items).reduce(
        (accumulator, current) => {
            for (let currentElement of current) {
                accumulator = accumulator.map(a => a.itemId).includes(currentElement.itemId) ? accumulator : accumulator.concat(currentElement);
            }
            return accumulator
        }, []
    ).filter(item => item.itemType == itemType && item.rankType == rankType)
        .sort((a, b) => {
            let findIndexA = data.map(gacha => gacha.items.map(i => i.itemId).includes(a.itemId)).reverse().findIndex(i => i);
            let findIndexB = data.map(gacha => gacha.items.map(i => i.itemId).includes(b.itemId)).reverse().findIndex(i => i);
            return sortB || findIndexB == 0 ? 1 : findIndexA == 0 ? -1 : findIndexB - findIndexA;
        })

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const commonItemId: number[] = [1042, 15502, 11501, 14502, 12502, 15501, 14501, 12501, 13505, 11502, 13502];

    return (
        <div className="text-center flex flex-col min-w-screen h-fit overflow-x-auto overflow-hidden overscroll-x-auto">
            {columnItems.length > 0 && columnItems.slice(-1).concat(columnItems)
                .map((item, index) => {
                    if (index == 0) {
                        return <div key={index} className={"flex flex-row shrink-0 w-fit h-fit"}>
                            <div className={classNames(itemClassName, "sticky left-0 bg-white z-10 ")}/>
                            <div className={classNames(itemClassName, "sticky left-20 bg-white z-10")} onClick={
                                () => setSortB(sortB == 0 ? 1 : 0)
                            }>
                                点我排序<br/>
                                {sortB == 0 ? "排序启用中" : "排序禁用中"}
                            </div>
                            {data.map(gacha => {
                                    return (
                                        <div key={`${index}-${gacha.id}`}
                                             className={classNames(itemClassName, "")}>
                                            {gacha.version}
                                            <img src={imageBaseUrl + gacha.image.url} alt={gacha.version}
                                                 className={classNames("border-solid rounded-1 hover:fixed hover:inset-x-0 hover:m-auto hover:z-20")}/>
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
                            <div className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-xs")}>
                                {
                                    rankType == 5 && !commonItemId.includes(item.itemId) ?
                                        (findIndex == 0 ? <div>当前可以祈愿</div> :
                                            <div>距离上次祈愿<br/>
                                                已经过去{findIndex}个卡池,{days}天
                                            </div>) : (findIndex == 0 ? <div>当前祈愿up</div> :
                                        <div>
                                            常驻祈愿<br/>
                                            距离上次up<br/>
                                            已经过去{findIndex}个卡池,{days}天
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
                                        return <div key={`${item.itemId}-${gacha.id}`} className={itemClassName}>
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
