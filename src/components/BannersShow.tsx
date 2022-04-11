import {gachaData, Item} from "genshin-wishes";
import moment from "moment";

interface IProps {
    itemType: string,
    rankType: number,
    data: gachaData[]
}

export default function BannersShow(props: IProps) {

    const {itemType, rankType, data} = props;

    const columnItems: Item[] = data.map(a => a.items).reduce(
        (accumulator, current) => {
            for (let currentElement of current) {
                accumulator = accumulator.map(a => a.itemId).includes(currentElement.itemId) ? accumulator : accumulator.concat(currentElement);
            }
            return accumulator
        }, []
    )

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const commonItemId: number[] = [1042,15502,11501,14502,12502,15501,14501,12501,13505,11502,13502];

    return (
        <div className="text-center flex flex-col w-9/12 max-h-screen overflow-auto">
            {columnItems.filter(item => item.itemType == itemType && item.rankType == rankType)
                .map(item => {
                    const borderColor = item.rankType == 5 ? "border-amber-500" : "border-purple-500";
                    let tempNumber: number = -1;
                    let findIndex = data.map(gacha => gacha.items.map(i => i.itemId).includes(item.itemId)).reverse().findIndex(b => b);
                    let pickUpGacha = data[data.length - 1 - findIndex];
                    let days = Math.floor(moment.duration(moment().diff(moment(pickUpGacha.end))).asDays());
                    return (<div key={item.itemId} className={"flex flex-row shrink-0"}>
                            <div className={itemClassName}>
                                <img src={item.image.url} alt={item.name}
                                     className={`${itemClassName} ${borderColor} border-solid rounded-[50%]`}/>
                            </div>
                            <div className={itemClassName + " text-xs"}>
                                {
                                    rankType == 5 && !commonItemId.includes(item.itemId)?
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
                                            <div key={`${item.itemId}-${gacha.id}`} className={itemClassName}>
                                                <img src={item.image.url} alt={item.name}
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
