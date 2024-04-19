import * as path from 'path'
import * as fs from 'fs'
import * as utils from './utils.js'

const basePath_msg = './work/agreedbot/msg'
const basePath_panel = './work/agreedbot/panel'

export const init = () => {
    //utils.createDirectoryIfNotExists(basePath_msg)
    //utils.createDirectoryIfNotExists(basePath_panel)
}

export const storeMsgData = async (chatid, poolAddress, tokenAddress, poolId, hashCode, msgData) => {

    const msgDatapath = path.join(basePath_msg, `${chatid}_${hashCode}`)


    let json = {
        poolAddress: poolAddress,
        tokenAddress: tokenAddress,
        chatid: chatid,
        poolId: poolId,
        data: msgData
    }

    return new Promise(async (resolve, reject) => {
        try {
            const text = btoa(encodeURIComponent(JSON.stringify(json)))
            fs.writeFileSync(msgDatapath, text)
            resolve(true)

        } catch (err) {

            console.error(err)
            resolve(false)
        }
    });
}

export const readMsgData = async (chatid, hashCode) => {
    const msgDatapath = path.join(basePath_msg, `${chatid}_${hashCode}`)

    return new Promise(async (resolve, reject) => {

        try {

            const result = fs.readFileSync(msgDatapath)

            const jsonObject = JSON.parse(decodeURIComponent(atob(result)));
            resolve(jsonObject)

        } catch (err) {

            resolve(null)
        }
    });
}

export const readPanelData = async (chatid, hashCode) => {
    const msgDatapath = path.join(basePath_panel, `${chatid}_${hashCode}`)

    //console.log('-- readPanelData', msgDatapath)
    return new Promise(async (resolve, reject) => {

        try {

            const result = fs.readFileSync(msgDatapath)

            const jsonObject = JSON.parse(decodeURIComponent(result));
            //const jsonObject = JSON.parse(decodeURIComponent(atob(result)));
            resolve(jsonObject)

        } catch (err) {

            resolve(null)
        }
    });
}

export const storePanelData = async (chatid, panelId, hashCode, tokenName, msgData) => {

    const msgDatapath = path.join(basePath_panel, `${chatid}_${hashCode}`)

    let json = {
        chatid: chatid,
        panelId: panelId,
        tokenName: tokenName,
        data: msgData
    }

    return new Promise(async (resolve, reject) => {
        try {
            //const text = btoa(encodeURIComponent(JSON.stringify(json)))
            const text = encodeURIComponent(JSON.stringify(json))
            fs.writeFileSync(msgDatapath, text)
            resolve(true)

        } catch (err) {

            console.error(err)
            resolve(false)
        }
    });
}