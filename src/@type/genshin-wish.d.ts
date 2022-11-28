declare module "genshin-wishes" {
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
}

