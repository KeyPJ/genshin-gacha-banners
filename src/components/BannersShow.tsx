import {gachaData, Item} from "genshin-wishes";
import React, {useEffect, useState} from "react";
import ScrollContainer from 'react-indiana-drag-scroll';
import {isMobile} from 'react-device-detect';
import {getFindLatestIndex} from "./Common";
import FirstRow from "./FirstRow";
import DataRow from "./DataRow";

// BannersShow 主组件
interface BannersShowProps {
    rankType: number[],
    setRankType: Function,
    weaponType: string[],
    elementType: string[],
    reset: Function,
    data: gachaData[],
    currentGachaItemId: number[],
    setCurrentGachaItemId: Function;
    showGachaVersions: string[]  // 改为存储版本号
    setShowGachaVersions: Function  // 对应修改
    itemType: string
    version?: string
    resetVersion?: Function
}

export default function BannersShow(props: BannersShowProps) {


    const {
        rankType,
        setRankType,
        weaponType,
        elementType,
        reset,
        data,
        currentGachaItemId,
        setCurrentGachaItemId,
        showGachaVersions,
        setShowGachaVersions,
        itemType,
        version,
        resetVersion,
    } = props;

    if (!data || data.length === 0) {
        return <div>加载中...</div>;
    }

    const [sortB, setSortB] = useState(0);

    const columnItems: Item[] = data
        .map(a => a.items)
        .reduce((accumulator, current) => {
            current.sort((b, a) => a.rankType - b.rankType);
            for (const currentElement of current) {
                if (!accumulator.map(a => a.itemId).includes(currentElement.itemId)) {
                    accumulator.push(currentElement);
                }
            }
            return accumulator;
        }, [] as Item[])
        .filter(item =>
            rankType.includes(item.rankType) &&
            weaponType.includes(item.weaponType) &&
            (itemType === 'Weapon' || elementType.includes(item.element || '')) &&
            (currentGachaItemId.length === 0 || currentGachaItemId.includes(item.itemId))
        )
        .sort((a, b) => {
            const findIndexA = getFindLatestIndex(data, a.itemId);
            const findIndexB = getFindLatestIndex(data, b.itemId);
            return (sortB || findIndexB === 0 ? 1 : findIndexA === 0 ? -1 : findIndexB - findIndexA);
        })
        .sort((b, a) => currentGachaItemId.length === 0 ? 1 : a.rankType - b.rankType);

    useEffect(() => {
        if (columnItems.length === 0) {
            reset();
        }
    }, [columnItems.length, reset]);

    const numbers = data
        .map(a => a.items.map(i => i.itemId).join(","))
        .join(",")
        .split(",")
        .map(id => getFindLatestIndex(data, +id));

    const findIndexMax = Math.max(...numbers);

    const flexRows = (
        <>
            {columnItems.length > 0 && columnItems.slice(-1).concat(columnItems).map((item, index) => (
                index === 0 ? (
                    <FirstRow
                        key={index}
                        rankType={rankType}
                        setRankType={setRankType}
                        data={data}
                        currentGachaItemId={currentGachaItemId}
                        setCurrentGachaItemId={setCurrentGachaItemId}
                        sortB={sortB}
                        setSortB={setSortB}
                        showGachaVersions={showGachaVersions}  // 传递版本数组
                        setShowGachaVersions={setShowGachaVersions}  // 传递版本设置函数
                        version={version}
                    />
                ) : (
                    <DataRow
                        key={index}
                        data={data}
                        item={item}
                        findIndexMax={findIndexMax}
                        showGachaVersions={showGachaVersions}  // 传递版本数组
                        currentGachaItemId={currentGachaItemId}
                        setShowGachaVersions={setShowGachaVersions}  // 传递版本设置函数
                        setCurrentGachaItemId={setCurrentGachaItemId}
                        version={version}
                        resetVersion={resetVersion}
                    />
                )
            ))}
        </>
    );

    console.log("showGachaVersions:", showGachaVersions)
    console.log("currentGachaItemId:", currentGachaItemId)

    return (
        <div className="text-center flex flex-col min-w-screen overflow-x-auto overflow-hidden overscroll-x-auto">
            {isMobile ? flexRows : (
                <ScrollContainer vertical={false}>
                    {flexRows}
                </ScrollContainer>
            )}
        </div>
    );
}
