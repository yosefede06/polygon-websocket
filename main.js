const WebSocket = require('ws')
const polygonWebSocket = "wss://polygonscan.com/wshandler"

/**
 * A program that retrieves data from a websocket endpoint in realtime,
 * as it appears on the official Polygon PoS Chain Explorer: https://polygonscan.com
 */
class Polygon {
    /**
     *
     * @param endpoint Endpoint retrieved from the interface
     * @param print
     */
    constructor(endpoint, print= 1) {
        this.print = print
        this.sendMessage = '{"event": "gs"}'
        this.ws = new WebSocket(endpoint);
        this.metadata = undefined
        this.requestNumber = 0
        this.block = 0
        this.info = undefined
        this.blocks = undefined
        this.txns = undefined
    }

    /**
     * Get last block number mint
     * @returns {*}
     */
    get getLastBlock ()
    {
        return this.info.lastblock
    }

    /**
     * 10 randomly selected transactions of the current response from the websocket
     * @returns {*}
     */
    get getTransactions ()
    {
        return this.txns
    }

    /**
     * MarketCap getter
     * @returns {*}
     */
    get getMarketCap()
    {
        return this.info.marketcap
    }

    /**
     * Block getter
     * @returns {*}
     */
    get getBlocks()
    {
        return this.blocks
    }

    /**
     * Print dedicated for general info
     */
    printGeneralInfo()
    {
        console.log(`Last Block: ${this.getLastBlock}`)
        console.log(`Matic MarketCap on Polygon: ${this.getMarketCap}`)
        console.log(`Number of blocks: ${this.getBlocks.length}`)
        console.log("")
    }

    /**
     * Prints internal data of each block
     */
    printData()
    {
        this.getBlocks.forEach((inBlock)=>{
            console.log(`Block: ${inBlock.b_no}. Minner: ${inBlock.b_miner}`)
        })

    }

    /**
     * Subscribes to the websocket
     * @param event
     */
    subscribe (event)
    {
        this.ws.on('message', response => {
            !this.requestNumber ? this.saveConnection(response) : this.retrieveData(response)
            this.requestNumber += 1
            this.ws.send(event)
        })
    }

    /**
     * First message sent by the endpoint when the first connection in established
     * @param response
     */
    saveConnection(response)
    {
        console.log(JSON.parse(response).event)
    }

    /**
     * Receives the relevant data of the endpoint and retrieves the data by checking redundant blocks
     * @param response
     */
    retrieveData(response)
    {
        let data = JSON.parse(response).dashb
        // Check unexpected undefined data caused by websocket
        let currBlock = data ? data.lastblock : 0
        if(this.block !== currBlock){
            this.block = currBlock
            this.metadata = JSON.parse(response)
            this.filter ()
            this.print ? this.printData() : undefined
        }
    }

    /**
     * Filter the response received by the endpoint and
     * saves inside predefined properties of the class
     */
    filter ()
    {
        this.info = this.metadata.dashb
        this.blocks = this.metadata.blocks
        this.txns = this.metadata.txns
    }

    /**
     * Runs the main program by subscribing to the websocket
     * and sends the message for a request of the relevant metadata
     */
    run ()
    {
        this.subscribe(this.sendMessage)
    }
}

/**
 * Creates a new instance of the class and calls the run method to start running the program
 */
function main(){
    new Polygon(polygonWebSocket, 1).run()
}

/**
 * Runs the main function of the program
 */
main()
