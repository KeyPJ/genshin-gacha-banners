// https://genshin-wishes.com/api/public/banners/character
// https://genshin-wishes.com/api/public/banners/weapon
declare module "genshin-wishes" {

    export interface Image {
        id: number;
        url: string;
    }

    export interface Item {
        id: number;
        itemId: number;
        name: string;
        itemType: string;
        rankType: number;
        image: Image;
    }

    export interface StartEndByRegion {
        AMERICA: string[];
        ASIA: string[];
        EUROPE: string[];
    }

    export interface Image2 {
        id: number;
        url: string;
    }

    export interface gachaData {
        id: number;
        version: string;
        items: Item[];
        start: string;
        end: string;
        startEndByRegion: StartEndByRegion;
        gachaType: string;
        image: Image2;
    }
}

