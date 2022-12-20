const {get} = require("axios")
const YAML = require('yaml')
const genshindb = require("genshin-db")
const fs = require('fs')
const path = require('path')

const versionNum = [[1, 6], [2, 8], [3, 6]]

const versions = versionNum.map(([a, b]) => Array.from(new Array(b + 1).keys()).map(v => [`${a}.${v}.1`, `${a}.${v}.2`].join(';')).join(";")).join(";").split(";")

const names = new Set()
const getId = (name, itemType) => {
    const value = itemType + name
    names.add(value)
    return Array.from(names).filter(n => n.includes(itemType)).findIndex(n => n === value)
}

const getVersion = (i, itemType) => {
    let versionsTemp = versions.slice(0)
    if (itemType == "Character") {
        versionsTemp = [...versionsTemp, "1.3.3"].sort()
    }
    return versionsTemp[i]
}


const getInfo = (name, itemType) => {
    let weaponType, imageUrl, rankType = -1, element, nameEn
    const opts = {
        dumpResult: false, // The query result will return an object with the properties: query, folder, match, matchtype, options, filename, result.
        matchNames: true, // Allows the matching of names.
        matchAltNames: true, // Allows the matching of alternate or custom names.
        matchAliases: false, // Allows the matching of aliases. These are searchable fields that returns the data object the query matched in.
        matchCategories: false, // Allows the matching of categories. If true, then returns an array if it matches.
        verboseCategories: false, // Used if a category is matched. If true, then replaces each string name in the array with the data object instead.
        queryLanguages: [genshindb.Language.English, genshindb.Language.ChineseSimplified],
        resultLanguage: genshindb.Language.English
    }
    if (itemType == "Character") {
        let character = genshindb.characters(name, opts)
        weaponType = character?.weapontype || ''
        imageUrl = character?.images?.icon?.replace("https://upload-os-bbs.mihoyo.com/", "") || ''
        rankType = +character?.rarity || -1
        element = character?.element
        nameEn = character?.fullname || name
    } else if (itemType == "Weapon") {
        let weapon = genshindb.weapons(name, opts)
        weaponType = weapon?.weapontype || ''
        imageUrl = weapon?.images?.icon?.replace("https://upload-os-bbs.mihoyo.com/", "") || ''
        rankType = +weapon?.rarity || -1
        nameEn = weapon?.name || name
    }
    return {
        itemId: getId(nameEn, itemType),
        weaponType,
        imageUrl,
        rankType,
        itemType,
        name,
        nameEn,
        element
    }
}

const fetchData = async (pool, type) => {
    const res = await get(`https://raw.fastgit.org/Le-niao/Yunzai-Bot/main/plugins/genshin/defSet/pool/${pool}.yaml`)
    const parse = (YAML.parse(res.data)).reverse()
    const length = parse.length
    const data = parse.map((a, i) => {
        const {from, to, five, four} = a
        const info5 = five.map(c => getInfo(c, type))
        const info4 = four.map(c => getInfo(c, type))
        return {
            version: getVersion(i, type),
            items: [...info5, ...info4],
            start: from,
            end: to,
        }
    })
    const characterFilePath = path.join(__dirname, `../public/data/${type.toLowerCase()}.json`)
    fs.writeFileSync(characterFilePath, JSON.stringify(data.reverse(), "", "\t"))
}

(async () => {
    await fetchData(301, "Character")
    await fetchData(302, "Weapon")
})()

