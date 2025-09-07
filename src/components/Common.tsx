import {gachaData} from "genshin-wishes";
import moment from "moment";

export interface Option {
    name: string,
    value: string,
}

export const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

export const generateOptionEle = (str: string, t: Function) => {
    let elementList: Option[] = [
        {name: t("ALL"), value: str},
    ]
    str.split(",").forEach(
        e => {
            elementList = elementList.concat({name: e, value: e})
        }
    )
    return elementList;
}

export const dateFormat = (start: string) => moment(start).format("YYYYMMDD");

// 工具函数：版本与索引转换
export const getIndexByVersion = (data: gachaData[], version: string): number => {
    return data?.findIndex(gacha => gacha.version === version);
};
// 计算最新出现索引
export const getFindLatestIndex = (data: gachaData[], itemId: number): number => {
    return data
        .map(gacha => gacha.items.some(i => i.itemId === itemId))
        .reverse()
        .findIndex(Boolean);
};
