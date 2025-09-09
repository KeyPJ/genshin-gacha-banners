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

// 获取选项索引
export const getOptionIndex = (value: string, options: Option[]): number => {
    const index = options.findIndex(option => option.value === value);
    return index === -1 ? 0 : index;
};

// 工具函数：通过索引获取选项
export const getOptionByIndex = (index: number, options: Option[]): Option => {
    return options[Math.max(0, Math.min(index, options.length - 1))];
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard API failed:', error);
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
    } catch (error) {
        console.error('Fallback copy failed:', error);
        return false;
    }
};

const isSNS = /weibo|qq/i.test(navigator.userAgent);
export const saveFile = (link: string, filename: string, el = document.createElement('a')) => {
    if (!isSNS) {
        el.download = filename;
    }
    el.href = link;
    el.target = '_blank';
    document.body.appendChild(el);
    el.click();
    setTimeout(() => {
        document.body.removeChild(el);
        if (link.startsWith('blob:')) {
            URL.revokeObjectURL(link);
        }
    }, 100);
};
