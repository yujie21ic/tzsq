
//greate by https://www.bitmex.com/api/explorer/swagger.json

export namespace BitMEXMessage {

    export interface Announcement {
        id: number /* format:int32*/
        link: string
        title: string
        content: string
        date: string /* format:date-time*/
    }

    export interface APIKey {
        id: string
        secret: string
        name: string
        nonce: number /* format:int64*/
        cidr: string
        permissions: any[]
        enabled: boolean
        userId: number /* format:int32*/
        created: string /* format:date-time*/
    }

    export interface Chat {
        id: number /* format:int32*/
        date: string /* format:date-time*/
        user: string
        message: string
        html: string
        fromBot: boolean
        channelID: number /* format:double*/
    }

    export interface ChatChannel {
        id: number /* format:int32*/
        name: string
    }

    export interface ConnectedUsers {
        users: number /* format:int32*/
        bots: number /* format:int32*/
    }

    export interface Execution {
        execID: string /* format:guid*/
        orderID: string /* format:guid*/
        clOrdID: string
        clOrdLinkID: string
        account: number /* format:int64*/
        symbol: string
        side: string
        lastQty: number /* format:int64*/
        lastPx: number /* format:double*/
        underlyingLastPx: number /* format:double*/
        lastMkt: string
        lastLiquidityInd: string
        simpleOrderQty: number /* format:double*/
        orderQty: number /* format:int64*/
        price: number /* format:double*/
        displayQty: number /* format:int64*/
        stopPx: number /* format:double*/
        pegOffsetValue: number /* format:double*/
        pegPriceType: string
        currency: string
        settlCurrency: string
        execType: string
        ordType: string
        timeInForce: string
        execInst: string
        contingencyType: string
        exDestination: string
        ordStatus: string
        triggered: string
        workingIndicator: boolean
        ordRejReason: string
        simpleLeavesQty: number /* format:double*/
        leavesQty: number /* format:int64*/
        simpleCumQty: number /* format:double*/
        cumQty: number /* format:int64*/
        avgPx: number /* format:double*/
        commission: number /* format:double*/
        tradePublishIndicator: string
        multiLegReportingType: string
        text: string
        trdMatchID: string /* format:guid*/
        execCost: number /* format:int64*/
        execComm: number /* format:int64*/
        homeNotional: number /* format:double*/
        foreignNotional: number /* format:double*/
        transactTime: string /* format:date-time*/
        timestamp: string /* format:date-time*/
    }

    export interface Funding {
        timestamp: string /* format:date-time*/
        symbol: string
        fundingInterval: string /* format:date-time*/
        fundingRate: number /* format:double*/
        fundingRateDaily: number /* format:double*/
    }

    export interface Instrument {
        symbol: string
        rootSymbol: string
        state: string
        typ: string
        listing: string /* format:date-time*/
        front: string /* format:date-time*/
        expiry: string /* format:date-time*/
        settle: string /* format:date-time*/
        relistInterval: string /* format:date-time*/
        inverseLeg: string
        sellLeg: string
        buyLeg: string
        optionStrikePcnt: number /* format:double*/
        optionStrikeRound: number /* format:double*/
        optionStrikePrice: number /* format:double*/
        optionMultiplier: number /* format:double*/
        positionCurrency: string
        underlying: string
        quoteCurrency: string
        underlyingSymbol: string
        reference: string
        referenceSymbol: string
        calcInterval: string /* format:date-time*/
        publishInterval: string /* format:date-time*/
        publishTime: string /* format:date-time*/
        maxOrderQty: number /* format:int64*/
        maxPrice: number /* format:double*/
        lotSize: number /* format:int64*/
        tickSize: number /* format:double*/
        multiplier: number /* format:int64*/
        settlCurrency: string
        underlyingToPositionMultiplier: number /* format:int64*/
        underlyingToSettleMultiplier: number /* format:int64*/
        quoteToSettleMultiplier: number /* format:int64*/
        isQuanto: boolean
        isInverse: boolean
        initMargin: number /* format:double*/
        maintMargin: number /* format:double*/
        riskLimit: number /* format:int64*/
        riskStep: number /* format:int64*/
        limit: number /* format:double*/
        capped: boolean
        taxed: boolean
        deleverage: boolean
        makerFee: number /* format:double*/
        takerFee: number /* format:double*/
        settlementFee: number /* format:double*/
        insuranceFee: number /* format:double*/
        fundingBaseSymbol: string
        fundingQuoteSymbol: string
        fundingPremiumSymbol: string
        fundingTimestamp: string /* format:date-time*/
        fundingInterval: string /* format:date-time*/
        fundingRate: number /* format:double*/
        indicativeFundingRate: number /* format:double*/
        rebalanceTimestamp: string /* format:date-time*/
        rebalanceInterval: string /* format:date-time*/
        openingTimestamp: string /* format:date-time*/
        closingTimestamp: string /* format:date-time*/
        sessionInterval: string /* format:date-time*/
        prevClosePrice: number /* format:double*/
        limitDownPrice: number /* format:double*/
        limitUpPrice: number /* format:double*/
        bankruptLimitDownPrice: number /* format:double*/
        bankruptLimitUpPrice: number /* format:double*/
        prevTotalVolume: number /* format:int64*/
        totalVolume: number /* format:int64*/
        volume: number /* format:int64*/
        volume24h: number /* format:int64*/
        prevTotalTurnover: number /* format:int64*/
        totalTurnover: number /* format:int64*/
        turnover: number /* format:int64*/
        turnover24h: number /* format:int64*/
        homeNotional24h: number /* format:double*/
        foreignNotional24h: number /* format:double*/
        prevPrice24h: number /* format:double*/
        vwap: number /* format:double*/
        highPrice: number /* format:double*/
        lowPrice: number /* format:double*/
        lastPrice: number /* format:double*/
        lastPriceProtected: number /* format:double*/
        lastTickDirection: string
        lastChangePcnt: number /* format:double*/
        bidPrice: number /* format:double*/
        midPrice: number /* format:double*/
        askPrice: number /* format:double*/
        impactBidPrice: number /* format:double*/
        impactMidPrice: number /* format:double*/
        impactAskPrice: number /* format:double*/
        hasLiquidity: boolean
        openInterest: number /* format:int64*/
        openValue: number /* format:int64*/
        fairMethod: string
        fairBasisRate: number /* format:double*/
        fairBasis: number /* format:double*/
        fairPrice: number /* format:double*/
        markMethod: string
        markPrice: number /* format:double*/
        indicativeTaxRate: number /* format:double*/
        indicativeSettlePrice: number /* format:double*/
        optionUnderlyingPrice: number /* format:double*/
        settledPrice: number /* format:double*/
        timestamp: string /* format:date-time*/
    }

    export interface InstrumentInterval {
        intervals: string[]
        symbols: string[]
    }

    export interface IndexComposite {
        timestamp: string /* format:date-time*/
        symbol: string
        indexSymbol: string
        reference: string
        lastPrice: number /* format:double*/
        weight: number /* format:double*/
        logged: string /* format:date-time*/
    }

    export interface Insurance {
        currency: string
        timestamp: string /* format:date-time*/
        walletBalance: number /* format:int64*/
    }

    export interface Leaderboard {
        name: string
        isRealName: boolean
        profit: number /* format:double*/
    }

    export interface Liquidation {
        orderID: string /* format:guid*/
        symbol: string
        side: string
        price: number /* format:double*/
        leavesQty: number /* format:int64*/
    }

    export interface GlobalNotification {
        id: number /* format:int32*/
        date: string /* format:date-time*/
        title: string
        body: string
        ttl: number /* format:int32*/
        type: string
        closable: boolean
        persist: boolean
        waitForVisibility: boolean
        sound: string
    }

    export interface Order {
        orderID: string /* format:guid*/
        clOrdID: string
        clOrdLinkID: string
        account: number /* format:int64*/
        symbol: string
        side: string
        simpleOrderQty: number /* format:double*/
        orderQty: number /* format:int64*/
        price: number /* format:double*/
        displayQty: number /* format:int64*/
        stopPx: number /* format:double*/
        pegOffsetValue: number /* format:double*/
        pegPriceType: string
        currency: string
        settlCurrency: string
        ordType: string
        timeInForce: string
        execInst: string
        contingencyType: string
        exDestination: string
        ordStatus: string
        triggered: string
        workingIndicator: boolean
        ordRejReason: string
        simpleLeavesQty: number /* format:double*/
        leavesQty: number /* format:int64*/
        simpleCumQty: number /* format:double*/
        cumQty: number /* format:int64*/
        avgPx: number /* format:double*/
        multiLegReportingType: string
        text: string
        transactTime: string /* format:date-time*/
        timestamp: string /* format:date-time*/
    }

    export interface OrderBookL2 {
        symbol: string
        id: number /* format:int64*/
        side: string
        size: number /* format:int64*/
        price: number /* format:double*/
    }

    export interface Position {
        account: number /* format:int64*/
        symbol: string
        currency: string
        underlying: string
        quoteCurrency: string
        commission: number /* format:double*/
        initMarginReq: number /* format:double*/
        maintMarginReq: number /* format:double*/
        riskLimit: number /* format:int64*/
        leverage: number /* format:double*/
        crossMargin: boolean
        deleveragePercentile: number /* format:double*/
        rebalancedPnl: number /* format:int64*/
        prevRealisedPnl: number /* format:int64*/
        prevUnrealisedPnl: number /* format:int64*/
        prevClosePrice: number /* format:double*/
        openingTimestamp: string /* format:date-time*/
        openingQty: number /* format:int64*/
        openingCost: number /* format:int64*/
        openingComm: number /* format:int64*/
        openOrderBuyQty: number /* format:int64*/
        openOrderBuyCost: number /* format:int64*/
        openOrderBuyPremium: number /* format:int64*/
        openOrderSellQty: number /* format:int64*/
        openOrderSellCost: number /* format:int64*/
        openOrderSellPremium: number /* format:int64*/
        execBuyQty: number /* format:int64*/
        execBuyCost: number /* format:int64*/
        execSellQty: number /* format:int64*/
        execSellCost: number /* format:int64*/
        execQty: number /* format:int64*/
        execCost: number /* format:int64*/
        execComm: number /* format:int64*/
        currentTimestamp: string /* format:date-time*/
        currentQty: number /* format:int64*/
        currentCost: number /* format:int64*/
        currentComm: number /* format:int64*/
        realisedCost: number /* format:int64*/
        unrealisedCost: number /* format:int64*/
        grossOpenCost: number /* format:int64*/
        grossOpenPremium: number /* format:int64*/
        grossExecCost: number /* format:int64*/
        isOpen: boolean
        markPrice: number /* format:double*/
        markValue: number /* format:int64*/
        riskValue: number /* format:int64*/
        homeNotional: number /* format:double*/
        foreignNotional: number /* format:double*/
        posState: string
        posCost: number /* format:int64*/
        posCost2: number /* format:int64*/
        posCross: number /* format:int64*/
        posInit: number /* format:int64*/
        posComm: number /* format:int64*/
        posLoss: number /* format:int64*/
        posMargin: number /* format:int64*/
        posMaint: number /* format:int64*/
        posAllowance: number /* format:int64*/
        taxableMargin: number /* format:int64*/
        initMargin: number /* format:int64*/
        maintMargin: number /* format:int64*/
        sessionMargin: number /* format:int64*/
        targetExcessMargin: number /* format:int64*/
        varMargin: number /* format:int64*/
        realisedGrossPnl: number /* format:int64*/
        realisedTax: number /* format:int64*/
        realisedPnl: number /* format:int64*/
        unrealisedGrossPnl: number /* format:int64*/
        longBankrupt: number /* format:int64*/
        shortBankrupt: number /* format:int64*/
        taxBase: number /* format:int64*/
        indicativeTaxRate: number /* format:double*/
        indicativeTax: number /* format:int64*/
        unrealisedTax: number /* format:int64*/
        unrealisedPnl: number /* format:int64*/
        unrealisedPnlPcnt: number /* format:double*/
        unrealisedRoePcnt: number /* format:double*/
        simpleQty: number /* format:double*/
        simpleCost: number /* format:double*/
        simpleValue: number /* format:double*/
        simplePnl: number /* format:double*/
        simplePnlPcnt: number /* format:double*/
        avgCostPrice: number /* format:double*/
        avgEntryPrice: number /* format:double*/
        breakEvenPrice: number /* format:double*/
        marginCallPrice: number /* format:double*/
        liquidationPrice: number /* format:double*/
        bankruptPrice: number /* format:double*/
        timestamp: string /* format:date-time*/
        lastPrice: number /* format:double*/
        lastValue: number /* format:int64*/
    }

    export interface Quote {
        timestamp: string /* format:date-time*/
        symbol: string
        bidSize: number /* format:int64*/
        bidPrice: number /* format:double*/
        askPrice: number /* format:double*/
        askSize: number /* format:int64*/
    }

    export interface Settlement {
        timestamp: string /* format:date-time*/
        symbol: string
        settlementType: string
        settledPrice: number /* format:double*/
        optionStrikePrice: number /* format:double*/
        optionUnderlyingPrice: number /* format:double*/
        bankrupt: number /* format:int64*/
        taxBase: number /* format:int64*/
        taxRate: number /* format:double*/
    }

    export interface Stats {
        rootSymbol: string
        currency: string
        volume24h: number /* format:int64*/
        turnover24h: number /* format:int64*/
        openInterest: number /* format:int64*/
        openValue: number /* format:int64*/
    }

    export interface StatsHistory {
        date: string /* format:date-time*/
        rootSymbol: string
        currency: string
        volume: number /* format:int64*/
        turnover: number /* format:int64*/
    }

    export interface StatsUSD {
        rootSymbol: string
        currency: string
        turnover24h: number /* format:int64*/
        turnover30d: number /* format:int64*/
        turnover365d: number /* format:int64*/
        turnover: number /* format:int64*/
    }

    export interface Trade {
        timestamp: string /* format:date-time*/
        symbol: string
        side: string
        size: number /* format:int64*/
        price: number /* format:double*/
        tickDirection: string
        trdMatchID: string /* format:guid*/
        grossValue: number /* format:int64*/
        homeNotional: number /* format:double*/
        foreignNotional: number /* format:double*/
    }

    export interface TradeBin {
        timestamp: string /* format:date-time*/
        symbol: string
        open: number /* format:double*/
        high: number /* format:double*/
        low: number /* format:double*/
        close: number /* format:double*/
        trades: number /* format:int64*/
        volume: number /* format:int64*/
        vwap: number /* format:double*/
        lastSize: number /* format:int64*/
        turnover: number /* format:int64*/
        homeNotional: number /* format:double*/
        foreignNotional: number /* format:double*/
    }

    export interface Wallet {
        account: number /* format:int64*/
        currency: string
        prevDeposited: number /* format:int64*/
        prevWithdrawn: number /* format:int64*/
        prevTransferIn: number /* format:int64*/
        prevTransferOut: number /* format:int64*/
        prevAmount: number /* format:int64*/
        prevTimestamp: string /* format:date-time*/
        deltaDeposited: number /* format:int64*/
        deltaWithdrawn: number /* format:int64*/
        deltaTransferIn: number /* format:int64*/
        deltaTransferOut: number /* format:int64*/
        deltaAmount: number /* format:int64*/
        deposited: number /* format:int64*/
        withdrawn: number /* format:int64*/
        transferIn: number /* format:int64*/
        transferOut: number /* format:int64*/
        amount: number /* format:int64*/
        pendingCredit: number /* format:int64*/
        pendingDebit: number /* format:int64*/
        confirmedDebit: number /* format:int64*/
        timestamp: string /* format:date-time*/
        addr: string
        script: string
        withdrawalLock: string[]
    }

    export interface Transaction {
        transactID: string /* format:guid*/
        account: number /* format:int64*/
        currency: string
        transactType: string
        amount: number /* format:int64*/
        fee: number /* format:int64*/
        transactStatus: string
        address: string
        tx: string
        text: string
        transactTime: string /* format:date-time*/
        timestamp: string /* format:date-time*/
    }

    export interface AccessToken {
        id: string
        ttl: number /* format:double description:time to live in seconds (2 weeks by default)*/
        created: string /* format:date-time*/
        userId: number /* format:double*/
    }

    export interface Affiliate {
        account: number /* format:int64*/
        currency: string
        prevPayout: number /* format:int64*/
        prevTurnover: number /* format:int64*/
        prevComm: number /* format:int64*/
        prevTimestamp: string /* format:date-time*/
        execTurnover: number /* format:int64*/
        execComm: number /* format:int64*/
        totalReferrals: number /* format:int64*/
        totalTurnover: number /* format:int64*/
        totalComm: number /* format:int64*/
        payoutPcnt: number /* format:double*/
        pendingPayout: number /* format:int64*/
        timestamp: string /* format:date-time*/
        referrerAccount: number /* format:double*/
        referralDiscount: number /* format:double*/
        affiliatePayout: number /* format:double*/
    }

    export interface User {
        id: number /* format:int32*/
        ownerId: number /* format:int32*/
        firstname: string
        lastname: string
        username: string
        email: string
        phone: string
        created: string /* format:date-time*/
        lastUpdated: string /* format:date-time*/
        preferences: BitMEXMessage.UserPreferences
        restrictedEngineFields: {
        }
        TFAEnabled: string
        affiliateID: string
        pgpPubKey: string
        country: string
        geoipCountry: string
        geoipRegion: string
        typ: string
    }

    export interface UserCommissionsBySymbol {
        __symbol__: BitMEXMessage.UserCommission
    }

    export interface Margin {
        account: number /* format:int64*/
        currency: string
        riskLimit: number /* format:int64*/
        prevState: string
        state: string
        action: string
        amount: number /* format:int64*/
        pendingCredit: number /* format:int64*/
        pendingDebit: number /* format:int64*/
        confirmedDebit: number /* format:int64*/
        prevRealisedPnl: number /* format:int64*/
        prevUnrealisedPnl: number /* format:int64*/
        grossComm: number /* format:int64*/
        grossOpenCost: number /* format:int64*/
        grossOpenPremium: number /* format:int64*/
        grossExecCost: number /* format:int64*/
        grossMarkValue: number /* format:int64*/
        riskValue: number /* format:int64*/
        taxableMargin: number /* format:int64*/
        initMargin: number /* format:int64*/
        maintMargin: number /* format:int64*/
        sessionMargin: number /* format:int64*/
        targetExcessMargin: number /* format:int64*/
        varMargin: number /* format:int64*/
        realisedPnl: number /* format:int64*/
        unrealisedPnl: number /* format:int64*/
        indicativeTax: number /* format:int64*/
        unrealisedProfit: number /* format:int64*/
        syntheticMargin: number /* format:int64*/
        walletBalance: number /* format:int64*/
        marginBalance: number /* format:int64*/
        marginBalancePcnt: number /* format:double*/
        marginLeverage: number /* format:double*/
        marginUsedPcnt: number /* format:double*/
        excessMargin: number /* format:int64*/
        excessMarginPcnt: number /* format:double*/
        availableMargin: number /* format:int64*/
        withdrawableMargin: number /* format:int64*/
        timestamp: string /* format:date-time*/
        grossLastValue: number /* format:int64*/
        commission: number /* format:double*/
    }

    export interface CommunicationToken {
        id: string
        userId: number /* format:int32*/
        deviceToken: string
        channel: string
    }

    export interface UserEvent {
        id: number /* format:double*/
        type: string
        eventType: string
        status: string
        eventStatus: string
        userId: number /* format:double*/
        createdById: number /* format:double*/
        ip: string
        geoipCountry: string
        geoipRegion: string
        geoipSubRegion: string
        eventMeta: {
        }
        created: string /* format:date-time*/
    }

    export interface UserPreferences {
        alertOnLiquidations: boolean
        animationsEnabled: boolean
        announcementsLastSeen: string /* format:date-time*/
        chatChannelID: number /* format:double*/
        colorTheme: string
        currency: string
        debug: boolean
        disableEmails: string[]
        disablePush: string[]
        hideConfirmDialogs: string[]
        hideConnectionModal: boolean
        hideFromLeaderboard: boolean
        hideNameFromLeaderboard: boolean
        hideNotifications: string[]
        locale: string
        msgsSeen: string[]
        orderBookBinning: {
        }
        orderBookType: string
        orderClearImmediate: boolean
        orderControlsPlusMinus: boolean
        showLocaleNumbers: boolean
        sounds: string[]
        strictIPCheck: boolean
        strictTimeout: boolean
        tickerGroup: string
        tickerPinned: boolean
        tradeLayout: string
    }

    export interface UserCommission {
        makerFee: number /* format:double*/
        takerFee: number /* format:double*/
        settlementFee: number /* format:double*/
        maxFee: number /* format:double*/
    }
}