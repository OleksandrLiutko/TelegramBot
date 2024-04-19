export const mapApiRepeater = new Map()

export const start = (web3) => {

    console.log('ApiRepeater daemon has been started...')

    setTimeout(() => {
        doEvent(web3)
    }
    , 1000 * 30)
}

export const doEvent = async (web3) => {

    let keyList = []
    for (const [key, state] of mapApiRepeater) {
        if (state.timestamp < Date.now()) {
            keyList.push(key)
        }
    }

    for (const key of keyList) {
        //console.log('[Api Repeater]', key)
        mapApiRepeater.delete(key)
    }

    setTimeout(() => {
        doEvent(web3)
    }
    , 1000 * 30)
}
