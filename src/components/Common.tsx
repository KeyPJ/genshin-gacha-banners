export interface Option {
    name: string,
    value: string,
}

export const classNames = (...classes: any) => classes.filter(Boolean).join(' ');

export const generateOptionEle = (str: string, t: Function) => {
    let elementList: Option[] = [
        {name: t("ALL"), value: str},
    ]
    str.split(",").forEach(
        e => {
            elementList = elementList.concat({name: e, value: e})
        }
    )
    return elementList;
}

const classToSelect = "bg-white shadow-sm text-gray-900 cursor-pointer"
const classSelected = "ring-2 border-indigo-500"

export const getDivElements = (weaponTypeList: Option[], weaponType: Option, type: string, setWeaponType: Function, setShowGachaIndex: Function) => {
    return weaponTypeList.map(rank => {
        let b = rank.value.split(",").length > 1;
        let getImg = (s: string) => `/${s}/${rank.name}.png`

        return <div key={rank.value}
                    className={classNames(classToSelect, rank.value == weaponType.value ? classSelected : "", "flex justify-center align-middle")}
                    onClick={() => {
                        setWeaponType(rank)
                        setShowGachaIndex([])
                    }}>{(b || !type) ? rank.name : <img src={getImg(type)}
                                                        alt={rank.name}
                                                        title={rank.name}
                                                        className={classNames(classToSelect, "border-solid rounded-[50%] bg-black w-10 h-10")}
        />}</div>
    });
}
