import {gachaData} from "genshin-wishes";
import {useTranslation} from "react-i18next";
import {classNames, dateFormat, getIndexByVersion} from "./Common";

// FirstRow 组件
interface IProps {
    rankType: number[],
    setRankType: Function,
    data: gachaData[],
    currentGachaItemId: number[],
    setCurrentGachaItemId: Function;
    sortB: number,
    setSortB: Function,
    showGachaVersions: string[],  // 改为存储版本号
    setShowGachaVersions: Function,  // 对应修改
    version?: string
}

export default function FirstRow(props: IProps) {
    const {t} = useTranslation();
    const {
        setRankType,
        data,
        currentGachaItemId,
        setCurrentGachaItemId,
        sortB,
        setSortB,
        showGachaVersions = [],
        setShowGachaVersions,
        version,
    } = props;

    const itemClassName = "border-2 w-20 h-20 shrink-0";

    const handleGachaClick = (itemIds: number[]) => {
        setRankType({name: t("ALL"), value: "4,5"});
        setCurrentGachaItemId(itemIds.toString() === currentGachaItemId.toString() ? [] : itemIds);
        setShowGachaVersions([]);  // 清空版本数组
    };

    // 基于版本号计算需要显示的索引
    const showIndex = showGachaVersions
        ?.map(version => getIndexByVersion(data, version))  // 版本转索引
        .filter(index => index !== -1)  // 过滤无效版本
        .map((n, index) => index === 0 ? [n] : [n, n - 1])
        .reduce((a, b) => a.concat(b), [])
        .filter(i => i >= 0)
        .concat(data.length - 1);

    return (
        <div className={"flex flex-row shrink-0 w-fit h-fit sticky top-0"}>
            <div
                className={classNames(itemClassName, "sticky left-0 bg-white z-10 text-sm whitespace-pre-line")}
                onClick={() => {
                    setSortB(1);
                    setCurrentGachaItemId([]);
                    setShowGachaVersions([]);
                }}
            >
                {t("rowClick")}
            </div>
            <div
                className={classNames(itemClassName, "sticky left-20 bg-white z-10 text-sm whitespace-pre-line")}
                onClick={() => setSortB(sortB === 0 ? 1 : 0)}
            >
                {sortB === 0 ? t("unavailable") : t("release")}
            </div>
            {data.map((gacha, index) => {
                const {version: gachaVersion, start, end} = gacha;
                const key = `0-${gachaVersion}`;
                // 基于版本号判断是否显示
                const showGacha = showGachaVersions.length > 0 && !showGachaVersions.includes(gachaVersion);
                const showVersion = version && version.split(",").length === 1 && !gachaVersion.startsWith(version.substring(0, 1));

                if (showGacha || showVersion) {
                    return <div key={key} className={showIndex.includes(index) && !showVersion ? itemClassName : ""}/>;
                }

                return (
                    <div
                        key={key}
                        className={classNames(
                            itemClassName,
                            "text-center text-sm cursor-pointer",
                            gacha.items.map(i => i.itemId).toString() === currentGachaItemId.toString()
                                ? "ring-2 border-indigo-500"
                                : ""
                        )}
                        onClick={() => handleGachaClick(gacha.items.map(i => i.itemId))}
                    >
                        {gachaVersion}<br/>
                        {dateFormat(start)}<br/>
                        {dateFormat(end)}<br/>
                    </div>
                );
            })}
        </div>
    );
};