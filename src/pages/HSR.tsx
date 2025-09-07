import GamePage from "../components/GamePage";

// 配置项
const config = {
    gameKey: 'hsr',
    itemTypeList: [
        { name: "CharacterText", value: "Character" },
        { name: "WeaponText", value: "Weapon" },
    ],
    rankTypeList: [
        { name: "ALL", value: "4,5" },
        { name: "☆5", value: "5" },
        { name: "☆4", value: "4" },
    ],
    weaponTypeOptions: "knight,mage,priest,rogue,shaman,warlock,warrior,memory",
    elementOptions: "fire,ice,imaginary,physical,quantum,thunder,wind",
    versionOptions: "1.0,2.0,3.0",
};

export default function HSR() {
    return <GamePage config={config} />;
}