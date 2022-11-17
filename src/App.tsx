import {useEffect, useState} from 'react'
import './App.css'
import BannersShow from "./components/BannersShow";
import {gachaData, Item} from "genshin-wishes";
import axios from "axios";

import {useRegisterSW} from 'virtual:pwa-register/react';
import GithubCorner from "react-github-corner";
import {useTranslation} from "react-i18next";
import {isMobile} from "react-device-detect";
import genshindb from "genshin-db";
import {inject} from "@vercel/analytics";

interface Option {
    name: string,
    value: string,
}

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

const getInfo = (name: string, itemType: string, language: string) => {
    let weaponType = '';
    let imageUrl = '';
    let rankType = -1;
    let element;
    const opts = {
        dumpResult: false, // The query result will return an object with the properties: query, folder, match, matchtype, options, filename, result.
        matchNames: true, // Allows the matching of names.
        matchAltNames: true, // Allows the matching of alternate or custom names.
        matchAliases: false, // Allows the matching of aliases. These are searchable fields that returns the data object the query matched in.
        matchCategories: false, // Allows the matching of categories. If true, then returns an array if it matches.
        verboseCategories: false, // Used if a category is matched. If true, then replaces each string name in the array with the data object instead.
        queryLanguages: [genshindb.Language.English, genshindb.Language.ChineseSimplified],
        resultLanguage: genshindb.Language.English
    }
    if (itemType == "Character") {
        let character = genshindb.characters(name, opts) as genshindb.Character;
        weaponType = character?.weapontype || '';
        imageUrl = character?.images?.icon?.replace("https://upload-os-bbs.mihoyo.com/", "") || '';
        rankType = +character?.rarity || -1;
        element = character?.element;
        if ("zh-CN" == language) {
            name = genshindb.characters(name, {
                ...opts,
                resultLanguage: genshindb.Language.ChineseSimplified
            })?.fullname || name;
        }
    } else if (itemType == "Weapon") {
        let weapon = genshindb.weapons(name, opts) as genshindb.Weapon;
        weaponType = weapon?.weapontype || '';
        imageUrl = weapon?.images?.icon?.replace("https://upload-os-bbs.mihoyo.com/", "") || '';
        rankType = +weapon?.rarity || -1;
        if ("zh-CN" == language) {
            name = genshindb.weapons(name, {
                ...opts,
                resultLanguage: genshindb.Language.ChineseSimplified
            })?.name || name;
        }
    }
    return {
        weaponType,
        imageUrl,
        rankType,
        itemType,
        name,
        element
    } as Item;
}

const generateOptionEle = (str: string, t: Function) => {
    let elementList: Option[] = [
        {name: t("ALL"), value: str},
    ]
    str.split(",").forEach(
        e => {
            elementList = elementList.concat({name: t(e), value: e})
        }
    )
    return elementList;
}

function App() {

    const {t, i18n} = useTranslation();

    const intervalMS = 60 * 60 * 1000
    useRegisterSW({
        onRegistered(r) {
            r && setInterval(() => {
                r.update()
            }, intervalMS)
        }
    });
    const [data, setData] = useState<gachaData[]>([]);

    const [commonItemId, setCommonItemId] = useState<number[]>([]);

    const itemTypeList: Option[] = [
        {name: t("CharacterText"), value: "Character"},
        {name: t("WeaponText"), value: "Weapon"},
    ]

    const rankTypeList: Option[] = [
        {name: t("ALL"), value: "4,5"},
        {name: "☆5", value: "5"},
        {name: "☆4", value: "4"},
    ]

    const weaponTypeList = generateOptionEle("Sword,Claymore,Polearm,Bow,Catalyst", t)

    const elementList = generateOptionEle("Pyro,Hydro,Anemo,Electro,Dendro,Cryo,Geo", t)

    const [itemType, setItemType] = useState(itemTypeList[0]);
    const [rankType, setRankType] = useState(rankTypeList[1]);
    const [weaponType, setWeaponType] = useState(weaponTypeList[0]);
    const [elementType, setElementType] = useState(elementList[0]);

    const languages = [
        {code: "zh-CN", value: "中文"},
        {code: "en-US", value: "English"}
    ]

    const [language, setLanguage] = useState('zh-CN')

    const changeLanguage = (value: string) => {
        setLanguage(value)
        i18n.changeLanguage(value)
    }

    useEffect(() => {
        let s = itemType.value.toLowerCase();
        axios.get(`/data/${s}.json`).then(
            res => {
                const resData = res.data as gachaData[];
                let set = new Set();
                setData(resData.map(gachaData => {
                    const {items} = gachaData
                    return {
                        ...gachaData,
                        items: items.map(item => {
                            const info = getInfo(item.name, itemType.value, language) as Item;
                            set.add(info?.element)
                            return {
                                ...item,
                                ...info
                            }
                        })
                    }
                }).reverse())
                console.log(set);
            }
        )
    }, [itemType, language])

    useEffect(() => {
        axios.get(`/data/permanent.json`).then(
            res => {
                const {countPerItemId} = res.data;
                const itemIds = countPerItemId.map((i: { itemId: number; }): number => i.itemId);
                setCommonItemId(itemIds);
            }
        )
        inject()
    }, [])

    const classToSelect = "bg-white shadow-sm text-gray-900 cursor-pointer"
    const classSelected = "ring-2 border-indigo-500"

    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>([]);

    const [showGachaIndex, setShowGachaIndex] = useState<number[]>([]);


    const weaponTypeElements = weaponTypeList.map(rank => {
        return <div key={rank.value}
                    className={classNames(classToSelect, rank.value == weaponType.value ? classSelected : "")}
                    onClick={() => {
                        setWeaponType(rank)
                        setShowGachaIndex([])
                    }}>{rank.name}</div>
    })
    weaponTypeElements.splice(4, 0, ...Array(3).fill(<div/>));
    weaponTypeElements.splice(weaponTypeElements.length, 0, ...Array(2).fill(<div/>));

    const characterElements = elementList.map(rank => {
        return <div key={rank.value}
                    className={classNames(classToSelect, rank.value == elementType.value ? classSelected : "")}
                    onClick={() => {
                        setElementType(rank)
                        setShowGachaIndex([])
                    }}>{rank.name}</div>
    })
    characterElements.splice(4, 0, ...Array(2).fill(<div/>));

    const reset = () => {
        setRankType(rankTypeList[0]);
        setWeaponType(weaponTypeList[0])
        setElementType(elementList[0])
    }

    return (
        <div className="App flex flex-col justify-between">
            <GithubCorner href="https://github.com/KeyPJ/genshin-gacha-banners"/>
            <div className="grid grid-cols-6 gap-2 mr-20 my-4 lg:w-1/2 text-center">
                <div className="text-right">{t("itemType")}</div>
                {
                    itemTypeList.map(item => {
                        return <div key={item.value}
                                    className={classNames("col-span-2", classToSelect, item.value == itemType.value ? classSelected : "")}
                                    onClick={() => {
                                        setItemType(item);
                                        setCurrentGachaItemId([])
                                        setShowGachaIndex([])
                                    }}>{item.name}</div>
                    })
                }
                <div/>
                <div className="text-right">{t("rankType")}</div>
                {
                    rankTypeList.map(rank => {
                        return <div key={rank.value}
                                    className={classNames(classToSelect, rank.value == rankType.value ? classSelected : "")}
                                    onClick={() => {
                                        setRankType(rank)
                                        setShowGachaIndex([])
                                    }}>{rank.name}</div>
                    })
                }
                <div/>
                <div/>
                <div className="text-right">{t("weaponType")}</div>
                {
                    weaponTypeElements
                }
                {itemType.value == 'Character' && <div className="text-right">{t("ElementType")}</div>}
                {
                    itemType.value == 'Character' && characterElements
                }
            </div>
            {!isMobile && <div className="text-center text-sm">❕{t("notice")}❕</div>}
            <BannersShow
                data={data}
                rankType={rankType.value.split(",").map(i => +i)}
                setRankType={setRankType}
                weaponType={weaponType.value.split(",")}
                elementType={elementType.value.split(",")}
                reset={reset}
                currentGachaItemId={currentGachaItemId}
                setCurrentGachaItemId={setCurrentGachaItemId}
                showGachaIndex={showGachaIndex}
                setShowGachaIndex={setShowGachaIndex}
                commonItemId={commonItemId}
                itemType={itemType.value}
            />
            {/*<div className="flex flex-row justify-center text-center my-4">*/}
            {/*    <div>{t("credit")}</div>*/}
            {/*    <div className="w-40 line-through"><a href={"https://genshin-wishes.com/"}>Genshin Wishes</a></div>*/}
            {/*    <div>{t("creditText")}</div>*/}

            {/*</div>*/}
            <div className="flex flex-row justify-center text-center my-4">
                <div className="w-20">{t("language")}</div>
                {
                    languages.map(l =>
                        <div className={classNames("w-20", language == l.code ? "underline" : "")}
                             onClick={() => changeLanguage(l.code)} key={l.code}>{l.value}
                        </div>)
                }
            </div>
        </div>
    )
}

export default App
