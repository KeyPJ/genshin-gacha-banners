import {useEffect, useState} from 'react'
import './App.css'
import BannersShow from "./components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";

import {useRegisterSW} from 'virtual:pwa-register/react';
import GithubCorner from "react-github-corner";
import {useTranslation} from "react-i18next";
import {isMobile} from "react-device-detect";
import {inject} from "@vercel/analytics";

interface Option {
    name: string,
    value: string,
}

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

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
                setData(resData.reverse())
            }
        )
    }, [itemType, language])

    useEffect(() => {
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
