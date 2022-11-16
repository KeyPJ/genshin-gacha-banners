declare module "genshin-wishes" {
    export interface Item {
        itemId: number;
        name: string;
        itemType: string;
        weaponType: string;
        imageUrl: string;
        rankType: number;
    }

    export interface gachaData {
        version: string;
        items: Item[];
        start: string;
        end: string;
    }
}

