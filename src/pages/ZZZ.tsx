import GamePage from "../components/GamePage";

// 配置项
const config = {
    gameKey: 'zzz',
    itemTypeList: [
        { name: "CharacterText", value: "Character" },
        { name: "WeaponText", value: "Weapon" },
    ],
    rankTypeList: [
        { name: "ALL", value: "4,5" },
        { name: "S", value: "5" },
        { name: "A", value: "4" },
    ],
    weaponTypeOptions: "Attack,Stun,Anomaly,Support,Defense,Rupture",
    elementOptions: "Physical,Fire,Ice,Electric,Ether",
    versionOptions: "1.0,2.0",
};

export default function ZZZ() {
    return <GamePage config={config} />;
}