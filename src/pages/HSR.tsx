import {useEffect, useState} from 'react'
import '../App.css'
import BannersShow from "../components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";

import GithubCorner from "react-github-corner";
import {useTranslation} from "react-i18next";
import {isMobile} from "react-device-detect";
import html2canvas from "html2canvas";
import {Link} from "react-router-dom";


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

    const weaponTypeList = generateOptionEle("knight,mage,priest,rogue,shaman,warlock,warrior", t)
// const weaponTypeList = generateOptionEle("1,2,3,4,5,6,7", t)

    const elementList = generateOptionEle("fire,ice,imaginary,physical,quantum,thunder,wind", t);
// const elementList = generateOptionEle("1,2,4,8,16,32,64", t)

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
        axios.get(`/data/hsr/${s}.json`).then(
            res => {
                const resData = res.data as gachaData[];
                setData(resData.reverse())
            }
        )
    }, [itemType, language])

    const classToSelect = "bg-white shadow-sm text-gray-900 cursor-pointer"
    const classSelected = "ring-2 border-indigo-500"

    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>([]);

    const [showGachaIndex, setShowGachaIndex] = useState<number[]>([]);


    const weaponTypeElements = weaponTypeList.map(rank => {
        let b = rank.value.split(",").length > 1;
        return <div key={rank.value}
                    className={classNames(classToSelect, rank.value == weaponType.value ? classSelected : "","flex justify-center align-middle")}
                    onClick={() => {
                        setWeaponType(rank)
                        setShowGachaIndex([])
                    }}>{b ? rank.name : <img src={`/path/${rank.name}.png`}
                                             alt={rank.name}
                                             title={rank.name}
                                             className={classNames(classToSelect, "border-solid rounded-[50%] bg-black w-10 h-10")}
        />}</div>
    })
    weaponTypeElements.splice(4, 0, ...Array(2).fill(<div/>));
    weaponTypeElements.splice(weaponTypeElements.length, 0, ...Array(1).fill(<div/>));

    const characterElements = elementList.map(rank => {
        let b = rank.value.split(",").length > 1;
        return <div key={rank.value}
                    className={classNames(classToSelect, rank.value == elementType.value ? classSelected : "","flex justify-center align-middle")}
                    onClick={() => {
                        setElementType(rank)
                        setShowGachaIndex([])
                    }}>{b ? rank.name : <img src={`/damage/${rank.name}.png`}
                                             alt={rank.name}
                                             title={rank.name}
                                             className={classNames(classToSelect, "border-solid rounded-[50%] bg-black w-10 h-10")}
        />}</div>
    })
    characterElements.splice(4, 0, ...Array(2).fill(<div/>));

    const reset = () => {
        setRankType(rankTypeList[0]);
        setWeaponType(weaponTypeList[0])
        setElementType(elementList[0])
    }

    const share = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const domRef = document.querySelector(".overscroll-x-auto") as HTMLElement;
                const domRef2 = document.querySelector(".top-0") as HTMLElement;
                html2canvas(domRef, {
                    useCORS: true,
                    scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2,
                    allowTaint: true,
                    width: domRef2.scrollWidth,
                    height: domRef.offsetHeight,
                    windowWidth: domRef2.scrollWidth,
                }).then((canvas) => {
                    canvas.toBlob(blob => {
                        const url = URL.createObjectURL(blob as Blob);
                        setTimeout(() => {
                            saveFile(url, `${location.host}.png`);
                        }, 50)
                    }, 'image/png');
                });
            }, 300);
        });
    }

    const isSNS = /weibo|qq/i.test(navigator.userAgent);
    const saveFile = (link: string, filename: string, el = document.createElement('a')) => {
        if (!isSNS) {
            el.download = filename;
        }
        el.href = link;
        el.click();
    };

    // return (
    //     <div>
    //         123123123
    //         <div className="flex flex-row justify-center text-center mb-4 underline">
    //             <Link to="/">{t("gi")}</Link>
    //         </div>
    //     </div>
    // )

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
                <div className="text-right">{t("pathType")}</div>
                {
                    weaponTypeElements
                }
                {itemType.value == 'Character' && <div className="text-right">{t("DamageType")}</div>}
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
            <div className="flex flex-row justify-center text-center my-2">

                <div className="w-20">{t("language")}</div>
                {
                    languages.map(l =>
                        <div className={classNames("w-20", language == l.code ? "underline" : "")}
                             onClick={() => changeLanguage(l.code)} key={l.code}>{l.value}
                        </div>)
                }
            </div>

            <div className="flex flex-row justify-center text-center mb-4">
                <div className="w-20 underline hover:bg-purple-700 whitespace-nowrap"
                     onClick={() => share()}>{t("share")}</div>
            </div>

            <div className="flex flex-row justify-center text-center mb-4 underline">
                <Link to="/">{t("gi")}</Link>
            </div>
        </div>
    )
}

export default App
