import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameConfig, Option } from '../types';
import { generateOptionEle, getOptionByIndex, getOptionIndex } from '../components/Common';

export interface URLState {
    itemType: Option;
    rankType: Option;
    weaponType: Option;
    elementType: Option;
    version: Option;
    currentGachaItemId: number[];
    currentGachaVersion: string;
    showGachaVersions: string[];
}

interface URLStateSetters {
    setItemType: (v: Option) => void;
    setRankType: (v: Option) => void;
    setWeaponType: (v: Option) => void;
    setElementType: (v: Option) => void;
    setVersion: (v: Option) => void;
    setCurrentGachaItemId: (v: number[]) => void;
    setCurrentGachaVersion: (v: string) => void;
    setShowGachaVersions: (v: string[]) => void;
}

type TFunction = (key: string) => string;

export function useURLState(config: GameConfig, t: TFunction) {
    const location = useLocation();
    const navigate = useNavigate();

    const weaponTypeList = generateOptionEle(config.weaponTypeOptions, t);
    const elementList = generateOptionEle(config.elementOptions, t);
    const versionList = generateOptionEle(config.versionOptions, t);

    const parseShortCode = useCallback((code: string) => {
        const [basePart, extraPart] = code.split('_');
        const parts = basePart.split('');

        let currentGachaVersion: string | null = null;
        let currentGachaItemId: number[] = [];

        if (extraPart) {
            if (/^[\d.]+$/.test(extraPart)) {
                currentGachaVersion = extraPart;
            } else {
                currentGachaItemId = extraPart.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
            }
        }

        return {
            itemType: getOptionByIndex(parseInt(parts[0] || '0'), config.itemTypeList),
            rankType: getOptionByIndex(parseInt(parts[1] || (currentGachaVersion ? '0' : '1')), config.rankTypeList),
            weaponType: getOptionByIndex(parseInt(parts[2] || '0'), weaponTypeList),
            elementType: getOptionByIndex(parseInt(parts[3] || '0'), elementList),
            version: getOptionByIndex(parseInt(parts[4] || (currentGachaVersion ? currentGachaVersion.slice(0, 1) : (versionList.length - 1).toString())), versionList),
            currentGachaItemId,
            gachaVersion: currentGachaVersion,
        };
    }, [config, weaponTypeList, elementList, versionList]);

    const initFromParams = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const s = searchParams.get('s');

        if (s) {
            return parseShortCode(s);
        }

        const gachaIds = searchParams.get('i');
        const currentGachaItemId = gachaIds
            ? gachaIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
            : [];

        const gachaVersion = searchParams.get('g') || null;

        return {
            itemType: getOptionByIndex(
                parseInt(searchParams.get('t') || '0'),
                config.itemTypeList
            ),
            rankType: getOptionByIndex(
                parseInt(searchParams.get('r') || (gachaVersion ? '0' : '1')),
                config.rankTypeList
            ),
            weaponType: getOptionByIndex(
                parseInt(searchParams.get('w') || '0'),
                weaponTypeList
            ),
            elementType: getOptionByIndex(
                parseInt(searchParams.get('e') || '0'),
                elementList
            ),
            version: getOptionByIndex(
                parseInt(searchParams.get('v') || (gachaVersion ? gachaVersion.slice(0, 1) : (versionList.length - 1).toString())),
                versionList
            ),
            currentGachaItemId,
            gachaVersion,
        };
    }, [location.search, config, weaponTypeList, elementList, versionList, parseShortCode]);

    const initialState = initFromParams();

    const [itemType, setItemType] = useState<Option>(initialState.itemType);
    const [rankType, setRankType] = useState<Option>(initialState.rankType);
    const [weaponType, setWeaponType] = useState<Option>(initialState.weaponType);
    const [elementType, setElementType] = useState<Option>(initialState.elementType);
    const [version, setVersion] = useState<Option>(initialState.version);
    const [currentGachaItemId, setCurrentGachaItemId] = useState<number[]>(initialState.currentGachaItemId || []);
    const [currentGachaVersion, setCurrentGachaVersion] = useState<string>(initialState.gachaVersion || "");
    const [showGachaVersions, setShowGachaVersions] = useState<string[]>([]);

    const generateShortCode = useCallback((): string => {
        const baseCode = [
            getOptionIndex(itemType.value, config.itemTypeList),
            getOptionIndex(rankType.value, config.rankTypeList),
            getOptionIndex(weaponType.value, weaponTypeList),
            getOptionIndex(elementType.value, elementList),
            getOptionIndex(version.value, versionList),
        ].join('');

        if (currentGachaItemId.length === 1) {
            return `${baseCode}_${currentGachaItemId.join(',')}`;
        } else if (currentGachaVersion) {
            return `${baseCode}_${currentGachaVersion}`;
        }

        return baseCode;
    }, [itemType, rankType, weaponType, elementType, version, currentGachaItemId, currentGachaVersion, config, weaponTypeList, elementList, versionList]);

    const resetFilters = useCallback(() => {
        setRankType(config.rankTypeList[0]);
        setWeaponType(weaponTypeList[0]);
        setElementType(elementList[0]);
        setVersion(versionList[versionList.length - 1]);
        setCurrentGachaItemId([]);
        setCurrentGachaVersion("");
        setShowGachaVersions([]);
    }, [config, weaponTypeList, elementList, versionList]);

    // Sync filters to URL
    useEffect(() => {
        const searchParams = new URLSearchParams();
        searchParams.delete('s');

        const defaults = {
            itemTypeValue: config.itemTypeList[0].value,
            rankTypeValue: config.rankTypeList[0].value,
            weaponTypeValue: weaponTypeList[0].value,
            elementTypeValue: elementList[0].value,
            versionValue: versionList[0].value,
        };

        if (itemType.value !== defaults.itemTypeValue) {
            searchParams.set('t', getOptionIndex(itemType.value, config.itemTypeList).toString());
        }
        if (rankType.value !== defaults.rankTypeValue) {
            searchParams.set('r', getOptionIndex(rankType.value, config.rankTypeList).toString());
        }
        if (weaponType.value !== defaults.weaponTypeValue) {
            searchParams.set('w', getOptionIndex(weaponType.value, weaponTypeList).toString());
        }
        if (elementType.value !== defaults.elementTypeValue) {
            searchParams.set('e', getOptionIndex(elementType.value, elementList).toString());
        }
        if (version.value !== defaults.versionValue) {
            searchParams.set('v', getOptionIndex(version.value, versionList).toString());
        }

        if (currentGachaVersion) {
            searchParams.set('g', currentGachaVersion);
            searchParams.delete('i');
        } else if (currentGachaItemId.length === 1) {
            searchParams.set('i', currentGachaItemId.join(','));
        }

        navigate({
            pathname: location.pathname,
            search: searchParams.toString()
        }, { replace: true });
    }, [itemType, rankType, weaponType, elementType, version, currentGachaItemId, currentGachaVersion]);

    return {
        state: {
            itemType, rankType, weaponType, elementType, version,
            currentGachaItemId, currentGachaVersion, showGachaVersions,
        } as URLState,
        setters: {
            setItemType, setRankType, setWeaponType, setElementType, setVersion,
            setCurrentGachaItemId, setCurrentGachaVersion, setShowGachaVersions,
        } as URLStateSetters,
        generateShortCode,
        resetFilters,
        weaponTypeList,
        elementList,
        versionList,
    };
}
