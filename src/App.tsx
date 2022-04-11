import {useEffect, useState} from 'react'
import './App.css'
import BannersShow from "./components/BannersShow";
import {gachaData} from "genshin-wishes";
import axios from "axios";
import Select, {Option} from "./components/Select";


function App() {
    const [data, setData] = useState<gachaData[]>([]);

    const itemTypeList: Option[] = [
        {name: "角色", value: "Character"},
        {name: "武器", value: "Weapon"},
    ]

    const rankTypeList: Option[] = [
        {name: "5", value: "5"},
        {name: "4", value: "4"},
    ]

    const [itemType, setItemType] = useState({name: "角色", value: "Character"});
    const [rankType, setRankType] = useState({name: "5", value: "5"},);

    useEffect(() => {
        let s = itemType.value.toLowerCase();
        axios.get(`/api/public/banners/${s}`).then(
            res => {
                const resData = res.data as gachaData[];
                setData(resData.reverse())
            }
        )
    }, [itemType])

    return (
        <div className="App flex justify-between">
            <div className="flex flex-col justify-items-center ml-20">
                <Select selectText="类型" optionList={itemTypeList} selectedObject={itemType}
                        setSelectedObject={setItemType}/>
                <Select selectText="星级" optionList={rankTypeList} selectedObject={rankType}
                        setSelectedObject={setRankType}/>
                <div className="text-lg p-12">
                    数据来源:<a href={"https://genshin-wishes.com/"}>Genshin Wishes</a>
                </div>
            </div>
            <BannersShow itemType={itemType.value} rankType={+rankType.value} data={data}/>
        </div>
    )
}

export default App
