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
import {classNames, generateOptionEle, getDivElements, Option} from "../components/Common";


function App() {

    const {t, i18n} = useTranslation();


    const [data, setData] = useState<gachaData[]>([]);

    const itemTypeList: Option[] = [
        {name: t("CharacterText"), value: "Character"},
        {name: t("WeaponText"), value: "Weapon"},
    ]

    const rankTypeList: Option[] = [
        {name: t("ALL"), value: "4,5"},
        {name: "S", value: "5"},
        {name: "A", value: "4"},
    ]

    const weaponTypeList = generateOptionEle("Attack,Stun,Anomaly,Support,Defense", t)

    const elementList = generateOptionEle("Physical,Fire,Ice,Electric,Ether", t)

    // const versionList = generateOptionEle("1.0", t)

    const [itemType, setItemType] = useState(itemTypeList[0]);
    const [rankType, setRankType] = useState(rankTypeList[1]);
    const [weaponType, setWeaponType] = useState(weaponTypeList[0]);
    const [elementType, setElementType] = useState(elementList[0]);
    // const [version, setVersion] = useState(versionList[0]);

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
        axios.get(`/data/zzz/${s}.json`).then(
            res => {
                const resData = res.data as gachaData[];
                setData(resData.reverse())
                // setVersion(versionList[versionList.length - 1])
            }
        )
    }, [itemType, language])


    const classToSelect = "bg-white shadow-sm text-gray-900 cursor-pointer"
    const classSelected = "ring-2 border-indigo-500"

    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>([]);

    const [showGachaIndex, setShowGachaIndex] = useState<number[]>([]);


    const weaponTypeElements = getDivElements(weaponTypeList, weaponType, "weapon/zzz", setWeaponType, setShowGachaIndex)
    weaponTypeElements.splice(4, 0, ...Array(3).fill(<div/>));
    weaponTypeElements.splice(weaponTypeElements.length, 0, ...Array(2).fill(<div/>));

    const characterElements = getDivElements(elementList, elementType, "element/zzz", setElementType, setShowGachaIndex)

    characterElements.splice(4, 0, ...Array(3).fill(<div/>));
    characterElements.splice(characterElements.length, 0, ...Array(1).fill(<div/>));

    // const versionElements = getDivElements(versionList, version, "", setVersion, setShowGachaIndex)
    // versionElements.splice(4, 0, ...Array(2).fill(<div/>));

    const reset = () => {
        setRankType(rankTypeList[0]);
        setWeaponType(weaponTypeList[0])
        setElementType(elementList[0])
        // setVersion(versionList[versionList.length - 1])
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
                {/*<div className="text-right">{t("version")}</div>*/}
                {/*{*/}
                {/*    versionElements*/}
                {/*}*/}
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
                // version={version.value}
                // resetVersion={() => setVersion(versionList[0])}
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

            <div className="flex flex-row justify-center text-center my-2">
                <div className="w-1/4 underline">
                    <Link to="/">{t("gi")}</Link>
                </div>
                <div className="w-1/4 underline">
                    <Link to="/hsr">{t("hsr")}</Link>
                </div>
                <div className="w-1/4 ">
                    <Link to="/zzz">{t("zzz")}</Link>
                </div>
            </div>

            <div className="flex flex-row justify-center text-center mb-4">
                <div className="w-20 underline hover:bg-purple-700 whitespace-nowrap"
                     onClick={() => share()}>{t("share")}</div>
            </div>

        </div>
    )
}

export default App
