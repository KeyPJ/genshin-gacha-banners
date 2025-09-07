import GamePage from "../components/GamePage";

// 配置项
const config = {
    gameKey: 'gi',
    itemTypeList: [
        { name: "CharacterText", value: "Character" },
        { name: "WeaponText", value: "Weapon" },
    ],
    rankTypeList: [
        { name: "ALL", value: "4,5" },
        { name: "☆5", value: "5" },
        { name: "☆4", value: "4" },
    ],
    weaponTypeOptions: "Sword,Claymore,Polearm,Bow,Catalyst",
    elementOptions: "Pyro,Hydro,Anemo,Electro,Dendro,Cryo,Geo",
    versionOptions: "1.0,2.0,3.0,4.0,5.0",
};

export default function GI() {
    return <GamePage config={config} />;
}