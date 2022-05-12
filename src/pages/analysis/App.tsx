import './App.css'
import * as genshindb from "genshin-db";
import {Character} from "genshin-db";
import ReactECharts from 'echarts-for-react';
import {useState} from "react";

const groupBy = <T extends { [key: string]: any }>(input: T[], key: keyof T): { [key: string]: T[] } => input.reduce((acc: { [key: string]: T[] }, currentValue) => {
    let groupKey = currentValue[key] as unknown as string;
    if (!acc[groupKey]) {
        acc[groupKey] = [];
    }
    acc[groupKey].push(currentValue);
    return acc;
}, {});


const groupByCount = <T extends { [key: string]: any }>(input: T[], key: keyof T): { [key: string]: number } => input.reduce((acc: { [key: string]: number }, currentValue) => {
    let groupKey = currentValue[key] as unknown as string;
    if (!acc[groupKey]) {
        acc[groupKey] = 0;
    }
    acc[groupKey] = acc[groupKey] + 1;
    return acc;
}, {});


const transpose = (arr: any[][]) => arr[0].map((col, i) => arr.map(row => row[i]));

function App() {

    const charactersname = genshindb.characters('names', {matchCategories: true}).filter(n => n != "Aether" && n != "Lumine");

    const characters: Character[] = charactersname.map(name => genshindb.characters(name) as Character);

    const groupByVersion = groupBy(characters, "version");

    const versions = Object.keys(groupByVersion).sort();

    const elements = Object.keys(groupBy(characters, "element"));

    const weapontypes = Object.keys(groupBy(characters, "weapontype"));

    const mapArr = versions.slice(-1).concat(versions).map((version, i) => {
        if (i == 0) {
            return ["version", ...elements]
        }

        const data = versions.filter(v => v <= version).map(v => groupByVersion[v]).reduce((a, b) => a.concat(b), []);

        const groupByElement: { [p: string]: number } = groupByCount(data, "element");

        const groupByWeapontype: { [p: string]: number } = groupByCount(data, "weapontype");

        const elementsArr = elements.map(e => groupByElement[e] || 0);

        const weapontypesArr = weapontypes.map(e => groupByWeapontype[e] || 0);

        return [version, ...elementsArr]

    });

    const [selectVersionDimension, setSelectVersionDimension] = useState(() => "1.0");

    const option = {
        legend: {},
        tooltip: {
            trigger: 'axis',
            showContent: false
        },
        dataset: {
            source: transpose(mapArr)
        },
        xAxis: {type: 'category'},
        yAxis: {gridIndex: 0},
        grid: {top: '55%'},
        series: [
            ...elements.map(e => ({
                type: 'line',
                smooth: true,
                seriesLayoutBy: 'row',
                emphasis: {focus: 'series'}
            }))
            ,
            {
                type: 'pie',
                id: 'pie',
                radius: '30%',
                center: ['50%', '25%'],
                emphasis: {
                    focus: 'self'
                },
                label: {
                    formatter: '{b}: {@[' + selectVersionDimension + ']} ({d}%)'
                },
                encode: {
                    itemName: 'version',
                    value: selectVersionDimension,
                    tooltip: selectVersionDimension
                }
            }
        ]
    };

    const updateAxisPointer = (event: any) => {
        const xAxisInfo = event.axesInfo[0];
        if (xAxisInfo) {
            const dimension = xAxisInfo.value + 1;
            setSelectVersionDimension(dimension)
        }
    }

    return (
        <ReactECharts
            option={option}
            style={{height: 800}}
            onEvents={{updateAxisPointer: updateAxisPointer}}
            lazyUpdate={true}
        />
    )
}

export default App
