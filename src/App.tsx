import {useEffect, useState} from 'react'
import './App.css'
import BannersShow from "./components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";

import {useRegisterSW} from 'virtual:pwa-register/react';
import GithubCorner from "react-github-corner";


interface Option {
    name: string,
    value: string,
}

const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

function App() {

    const intervalMS = 60 * 60 * 1000

    const updateServiceWorker = useRegisterSW({
        onRegistered(r) {
            r && setInterval(() => {
                r.update()
            }, intervalMS)
        }
    })

    const [data, setData] = useState<gachaData[]>([]);

    const itemTypeList: Option[] = [
        {name: "角色", value: "Character"},
        {name: "武器", value: "Weapon"},
    ]

    const rankTypeList: Option[] = [
        {name: "☆☆☆☆☆", value: "5"},
        {name: "☆☆☆☆", value: "4"},
    ]

    const [itemType, setItemType] = useState(itemTypeList[0]);
    const [rankType, setRankType] = useState(rankTypeList[0]);

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

    return (
        <div className="App flex flex-col justify-between">
            <GithubCorner href="https://github.com/KeyPJ/genshin-gacha-banners"/>
            <div className="grid grid-cols-3 gap-2 mr-20 my-4 lg:w-1/4">
                <div className="text-right">类型:</div>
                {
                    itemTypeList.map(item => {
                        return <div key={item.value}
                                    className={classNames(classToSelect, item.value == itemType.value ? classSelected : "")}
                                    onClick={() => setItemType(item)}>{item.name}</div>
                    })
                }
                <div className="text-right">星级:</div>
                {
                    rankTypeList.map(rank => {
                        return <div key={rank.value}
                                    className={classNames(classToSelect, rank.value == rankType.value ? classSelected : "")}
                                    onClick={() => setRankType(rank)}>{rank.name}</div>
                    })
                }
            </div>
            <BannersShow itemType={itemType.value} rankType={+rankType.value} data={data}/>
            <div className="text-center underline my-4">
                数据来源:<a href={"https://genshin-wishes.com/"}>Genshin Wishes</a>
            </div>
        </div>
    )
}

export default App
