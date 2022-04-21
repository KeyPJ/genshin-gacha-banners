import {useEffect, useState} from 'react'
import './App.css'
import BannersShow from "./components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";

import {useRegisterSW} from 'virtual:pwa-register/react';
import GithubCorner from "react-github-corner";
import {useTranslation} from "react-i18next";
import i18n from "i18next";


interface Option {
    name: string,
    value: string,
}

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

function App() {

    const {t} = useTranslation();

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
        {name: "☆☆☆☆☆", value: "5"},
        {name: "☆☆☆☆", value: "4"},
    ]


    const [itemType, setItemType] = useState(itemTypeList[0]);
    const [rankType, setRankType] = useState(rankTypeList[1]);

    useEffect(() => {
        let s = itemType.value.toLowerCase();
        axios.get(`/api/public/banners/${s}`).then(
            res => {
                const resData = res.data as gachaData[];
                setData(resData.reverse())
            }
        )
    }, [itemType])

    const classToSelect = "bg-white shadow-sm text-gray-900 cursor-pointer"
    const classSelected = "ring-2 border-indigo-500"

    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>([]);

    const [showGachaIndex, setShowGachaIndex] = useState<number[]>([]);

    const languages = [
        {code: "zh-CN", value: "中文"},
        {code: "en-US", value: "English"}
    ]

    const [language, setLanguage] = useState('zh-CN')

    const changeLanguage = (value: string) => {
        setLanguage(value)
        i18n.changeLanguage(value)
    }


    return (
        <div className="App flex flex-col justify-between">
            <GithubCorner href="https://github.com/KeyPJ/genshin-gacha-banners"/>
            <div className="grid grid-cols-4 gap-2 mr-20 my-4 lg:w-1/4 text-center">
                <div className="text-right">{t("itemType")}</div>
                {
                    itemTypeList.map(item => {
                        return <div key={item.value}
                                    className={classNames(classToSelect, item.value == itemType.value ? classSelected : "")}
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
            </div>
            <BannersShow
                data={data}
                rankType={rankType.value.split(",").map(i => +i)}
                setRankType={setRankType}
                currentGachaItemId={currentGachaItemId}
                setCurrentGachaItemId={setCurrentGachaItemId}
                showGachaIndex={showGachaIndex}
                setShowGachaIndex={setShowGachaIndex}
            />
            <div className="flex flex-row justify-center text-center my-4">
                <div>{t("credit")}</div>
                <div className="w-40 underline"><a href={"https://genshin-wishes.com/"}>Genshin Wishes</a></div>

            </div>
            <div className="flex flex-row justify-center text-center mb-4">
                <div className="w-20">{t("language")}</div>
                {
                    languages.map(l =>
                        <div className={classNames("w-20", language == l.code ? "underline" : "")}
                             onClick={() => changeLanguage(l.code)}>{l.value}
                        </div>)
                }
            </div>
        </div>
    )
}

export default App
