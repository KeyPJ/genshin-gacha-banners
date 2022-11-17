import {gachaData, Item} from "genshin-wishes";
import {useEffect, useState} from "react";
import ScrollContainer from 'react-indiana-drag-scroll'
import {isMobile} from 'react-device-detect';
import FirstRow from "./FirstRow";
import DataRow from "./DataRow";

interface IProps {
    rankType: number[],
    setRankType: Function,
    weaponType: string[],
    elementType: string[],
    reset: Function,
    data: gachaData[],
    currentGachaItemId: number[],
    setCurrentGachaItemId: Function;
    showGachaIndex: number[]
    setShowGachaIndex: Function
    commonItemId: number[]
    itemType: string
}

const getFindLatestIndex = (data: gachaData[], itemId: number): number => {
    return data.map(gacha => gacha.items.map(i => i.itemId).includes(itemId)).reverse().findIndex(tf => tf);
};
export default function BannersShow(props: IProps) {
    const {
        rankType,
        setRankType,
        weaponType,
        elementType,
        reset,
        data,
        currentGachaItemId,
        setCurrentGachaItemId,
        showGachaIndex,
        setShowGachaIndex,
        commonItemId,
        itemType
    } = props;

    //enable Sort?default:false
    const [sortB, setSortB] = useState(1);

    const columnItems: Item[] = data
        .map(a => a.items)
        .reduce(
            (accumulator, current) => {
                current.sort((b, a) => a.rankType - b.rankType)
                for (let currentElement of current) {
                    accumulator = accumulator.map(a => a.itemId).includes(currentElement.itemId) ? accumulator : accumulator.concat(currentElement);
                }
                return accumulator
            }, [])
        .filter(
            item => rankType.includes(item.rankType)
                && (weaponType.includes(item.weaponType))
                && (itemType == 'Weapon' || elementType.includes(item.element || ''))
                && (currentGachaItemId.length == 0 || currentGachaItemId.includes(item.itemId))
        )
        .sort((a, b) => {
            let findIndexA = getFindLatestIndex(data, a.itemId);
            let findIndexB = getFindLatestIndex(data, b.itemId);
            return (sortB || findIndexB == 0 ? 1 : findIndexA == 0 ? -1 : findIndexB - findIndexA);
        })
        .sort((b, a) => currentGachaItemId.length == 0 ? 1 : a.rankType - b.rankType)
    useEffect(() => {
        if (columnItems.length == 0) {
            reset()
        }
    }, [columnItems.length])

    const numbers = data.map(a => a.items.map(i => i.itemId).join(",")).join(",").split(",").map(
        id => getFindLatestIndex(data, +id)
    );

    const findIndexMax = Math.max(...numbers);
    const flexRows = <>{columnItems.length > 0 && columnItems.slice(-1).concat(columnItems)
        .map((item, index) => {
            return index == 0 ?
                <FirstRow key={index} rankType={rankType} setRankType={setRankType} data={data}
                          currentGachaItemId={currentGachaItemId}
                          setCurrentGachaItemId={setCurrentGachaItemId}
                          sortB={sortB}
                          setSortB={setSortB}
                          showGachaIndex={showGachaIndex}
                          setShowGachaIndex={setShowGachaIndex}
                />
                :
                <DataRow key={index} data={data} item={item} findIndexMax={findIndexMax}
                         showGachaIndex={showGachaIndex}
                         setShowGachaIndex={setShowGachaIndex}
                         setCurrentGachaItemId={setCurrentGachaItemId}
                         commonItemId={commonItemId}
                />;
        })
    }</>;
    return (
        <div
            className="text-center flex flex-col min-w-screen min-w-screen overflow-x-auto overflow-hidden overscroll-x-auto">
            {
                isMobile ? flexRows :
                    <ScrollContainer vertical={false}>
                        {flexRows}
                    </ScrollContainer>
            }
        </div>
    )
}
