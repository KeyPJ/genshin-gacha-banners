import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { classNames, Option } from "./Common";

interface FilterGroup {
    id: string;
    label: string;
    options: Option[];
    visible?: (itemType: string) => boolean;
}

interface FilterSectionProps {
    itemType: Option;
    setItemType: (option: Option) => void;
    rankType: Option;
    setRankType: (option: Option) => void;
    weaponType: Option;
    setWeaponType: (option: Option) => void;
    elementType: Option;
    setElementType: (option: Option) => void;
    version: Option;
    setVersion: (option: Option) => void;
    showGachaVersions: string[];
    setShowGachaVersions: (indexes: string[]) => void;
    itemTypeList: Option[];
    rankTypeList: Option[];
    weaponTypeList: Option[];
    elementList: Option[];
    versionList: Option[];
    gameKey: string;
    reset: () => void;
}

const FilterSection = ({
    itemType, setItemType, rankType, setRankType,
    weaponType, setWeaponType, elementType, setElementType,
    version, setVersion, setShowGachaVersions,
    itemTypeList, rankTypeList, weaponTypeList, elementList, versionList,
    gameKey, reset,
}: FilterSectionProps) => {
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filterGroups: FilterGroup[] = [
        { id: 'itemType', label: t('itemType'), options: itemTypeList },
        { id: 'basic', label: t('rankType'), options: rankTypeList },
        { id: 'weapon', label: t('weaponType'), options: weaponTypeList, visible: () => true },
        { id: 'element', label: t('ElementType'), options: elementList, visible: (type) => type === 'Character' },
        { id: 'version', label: t('version'), options: versionList },
    ];

    const getCurrentValue = (groupId: string): Option | null => {
        switch (groupId) {
            case 'itemType': return itemType;
            case 'basic': return rankType;
            case 'weapon': return weaponType;
            case 'element': return elementType;
            case 'version': return version;
            default: return null;
        }
    };

    const setCurrentValue = (groupId: string, value: Option) => {
        setShowGachaVersions([]);
        switch (groupId) {
            case 'itemType': reset(); setItemType(value); break;
            case 'basic': setRankType(value); break;
            case 'weapon': setWeaponType(value); break;
            case 'element': setElementType(value); break;
            case 'version': setVersion(value); break;
        }
    };

    const getIconPath = (group: FilterGroup, option: Option) => {
        if (!["weapon", "element"].includes(group.id) || option.value.includes(',')) {
            return null;
        }
        return `/icon/${gameKey}/${group.id}/${option.value}.png`;
    };

    const accentColor = gameKey === 'hsr' ? 'purple' : gameKey === 'zzz' ? 'red' : 'blue';

    return (
        <div className="glass-card w-full max-w-3xl mx-auto p-5 mb-4 animate-fade-in">
            <div className="space-y-5">
                {filterGroups.map(group => {
                    if (group.visible && !group.visible(itemType.value)) return null;

                    const getActiveChipClass = () => {
                        const colorMap: Record<string, string> = {
                            blue: "bg-blue-500/15 border-blue-500/40 text-blue-400 dark:text-white shadow-sm",
                            purple: "bg-purple-500/15 border-purple-500/40 text-purple-400 dark:text-white shadow-sm",
                            red: "bg-red-500/15 border-red-500/40 text-red-400 dark:text-white shadow-sm",
                        };
                        return colorMap[accentColor] || colorMap.blue;
                    };

                    return (
                        <div key={group.id}>
                            <h4 className="text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                                {group.label}
                            </h4>

                            <div className={classNames(
                                "flex flex-wrap gap-2",
                                isMobile ? "justify-center" : ""
                            )}>
                                {group.options.map(option => {
                                    const iconPath = getIconPath(group, option);
                                    const isActive = getCurrentValue(group.id)?.value === option.value;

                                    return (
                                        <div
                                            key={option.value}
                                            className={classNames(
                                                "px-3 py-2 text-center rounded-lg cursor-pointer transition-all duration-200 text-sm",
                                                isActive
                                                    ? getActiveChipClass()
                                                    : "bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/10"
                                            )}
                                            onClick={() => setCurrentValue(group.id, option)}
                                        >
                                            {iconPath ? (
                                                <img
                                                    src={iconPath}
                                                    alt={t(option.name)}
                                                    className="w-9 h-9 object-contain rounded-full bg-gray-200 dark:bg-black/50 p-0.5"
                                                />
                                            ) : (
                                                <span>{t(option.name)}</span>
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
