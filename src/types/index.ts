export interface Item {
    itemId: number;
    name: string;
    nameEn: string;
    itemType: string;
    weaponType: string;
    imageUrl: string;
    rankType: number;
    element?: string;
}

export interface gachaData {
    version: string;
    items: Item[];
    start: string;
    end: string;
}

export interface Option {
    name: string;
    value: string;
}

export interface GameConfig {
    gameKey: string;
    itemTypeList: Option[];
    rankTypeList: Option[];
    weaponTypeOptions: string;
    elementOptions: string;
    versionOptions: string;
}
