import {useState, useEffect} from 'react';
import {useTranslation} from "react-i18next";
import {classNames, Option} from "./Common";

interface FilterGroup {
    id: string;
    label: string;
    options: Option[];
    visible?: (itemType: string) => boolean;
}

interface FilterSectionProps {
    itemType: Option,
    setItemType: (option: Option) => void,
    rankType: Option,
    setRankType: (option: Option) => void,
    weaponType: Option,
    setWeaponType: (option: Option) => void,
    elementType: Option,
    setElementType: (option: Option) => void,
    version: Option,
    setVersion: (option: Option) => void,
    showGachaVersions: string[],
    setShowGachaVersions: (indexes: string[]) => void,
    itemTypeList: Option[],
    rankTypeList: Option[],
    weaponTypeList: Option[],
    elementList: Option[],
    versionList: Option[],
    gameKey: string
    reset: Function
}

const FilterSection = ({
                           itemType,
                           setItemType,
                           rankType,
                           setRankType,
                           weaponType,
                           setWeaponType,
                           elementType,
                           setElementType,
                           version,
                           setVersion,
                           showGachaVersions,
                           setShowGachaVersions,
                           itemTypeList,
                           rankTypeList,
                           weaponTypeList,
                           elementList,
                           versionList,
                           gameKey,
                           reset
                       }: FilterSectionProps) => {
    const {t} = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 响应式处理
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 筛选组配置
    const filterGroups: FilterGroup[] = [
        {
            id: 'itemType',
            label: t('itemType'),
            options: itemTypeList
        },
        {
            id: 'basic',
            label: t('rankType'),
            options: rankTypeList
        },
        {
            id: 'weapon',
            label: t('weaponType'),
            options: weaponTypeList,
            visible: () => true
        },
        {
            id: 'element',
            label: t('ElementType'),
            options: elementList,
            visible: (type) => type === 'Character'
        },
        {
            id: 'version',
            label: t('version'),
            options: versionList
        }
    ];

    // 获取当前组的选中值
    const getCurrentValue = (groupId: string) => {
        switch (groupId) {
            case 'itemType':
                return itemType;
            case 'basic':
                return rankType;
            case 'weapon':
                return weaponType;
            case 'element':
                return elementType;
            case 'version':
                return version;
            default:
                return null;
        }
    };

    // 设置选中值
    const setCurrentValue = (groupId: string, value: Option) => {
        switch (groupId) {
            case 'itemType':
                reset();
                setItemType(value);
                setShowGachaVersions([]);
                break;
            case 'basic':
                setRankType(value);
                setShowGachaVersions([]);
                break;
            case 'weapon':
                setWeaponType(value);
                setShowGachaVersions([]);
                break;
            case 'element':
                setElementType(value);
                setShowGachaVersions([]);
                break;
            case 'version':
                setVersion(value);
                setShowGachaVersions([]);
                break;
        }
    };

    // 获取图标路径
    const getIconPath = (group: FilterGroup, option: Option) => {
        if (!["weapon", "element"].includes(group.id) || option.value.includes(',')) { // 全选选项显示文本
            return null;
        }
        return `/icon/${gameKey}/${group.id}/${option.value}.png`;
    };

    return (
        <div className="filter-section w-full max-w-3xl mx-auto p-4 bg-white rounded-lg shadow-sm border">
            <div className="space-y-6">
                {filterGroups.map(group => {
                    if (group.visible && !group.visible(itemType.value)) return null;

                    return (
                        <div key={group.id} className="filter-group">
                            <h4 className="text-base font-medium text-gray-800 mb-3">
                                {group.label}
                            </h4>

                            <div className={classNames(
                                "flex flex-wrap gap-2 sm:gap-3",
                                isMobile ? "justify-center" : ""
                            )}>
                                {group.options.map(option => {
                                    const iconPath = getIconPath(group, option);
                                    return (
                                        <div
                                            key={option.value}
                                            className={classNames(
                                                "px-3 py-2 text-center rounded cursor-pointer transition-all text-sm sm:text-base",
                                                getCurrentValue(group.id)?.value === option.value
                                                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                                                    : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                                            )}
                                            onClick={() => setCurrentValue(group.id, option)}
                                        >
                                            {iconPath ? (
                                                <img
                                                    src={iconPath}
                                                    alt={t(option.name)}
                                                    className="w-8 h-8 object-contain border-solid rounded-[50%] bg-black "
                                                />
                                            ) : (
                                                <span className="text-sm sm:text-base">{t(option.name)}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterSection;