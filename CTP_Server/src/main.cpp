#pragma   warning(disable:4996) 

#include <iostream>
#include <stdio.h>
#include <string>
#include <unordered_map>




#include <vector>
#include "CTP_API/ThostFtdcMdApi.h"

class CustomMdSpi : public CThostFtdcMdSpi
{
	// ---- 继承自CTP父类的回调接口并实现 ---- //
public:
	///当客户端与交易后台建立起通信连接时（还未登录前），该方法被调用。
	void OnFrontConnected();

	///当客户端与交易后台通信连接断开时，该方法被调用。当发生这个情况后，API会自动重新连接，客户端可不做处理。
	///@param nReason 错误原因
	///        0x1001 网络读失败
	///        0x1002 网络写失败
	///        0x2001 接收心跳超时
	///        0x2002 发送心跳失败
	///        0x2003 收到错误报文
	void OnFrontDisconnected(int nReason);

	///心跳超时警告。当长时间未收到报文时，该方法被调用。
	///@param nTimeLapse 距离上次接收报文的时间
	void OnHeartBeatWarning(int nTimeLapse);

	///登录请求响应
	void OnRspUserLogin(CThostFtdcRspUserLoginField *pRspUserLogin, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///登出请求响应
	void OnRspUserLogout(CThostFtdcUserLogoutField *pUserLogout, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///错误应答
	void OnRspError(CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///订阅行情应答
	void OnRspSubMarketData(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///取消订阅行情应答
	void OnRspUnSubMarketData(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///订阅询价应答
	void OnRspSubForQuoteRsp(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///取消订阅询价应答
	void OnRspUnSubForQuoteRsp(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///深度行情通知
	void OnRtnDepthMarketData(CThostFtdcDepthMarketDataField *pDepthMarketData);

	///询价通知
	void OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *pForQuoteRsp);
};





#include "CTP_API/ThostFtdcTraderApi.h"

class CustomTradeSpi : public CThostFtdcTraderSpi
{
	// ---- ctp_api部分回调接口 ---- //
public:
	///当客户端与交易后台建立起通信连接时（还未登录前），该方法被调用。
	void OnFrontConnected();

	///登录请求响应
	void OnRspUserLogin(CThostFtdcRspUserLoginField *pRspUserLogin, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///错误应答
	void OnRspError(CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///当客户端与交易后台通信连接断开时，该方法被调用。当发生这个情况后，API会自动重新连接，客户端可不做处理。
	void OnFrontDisconnected(int nReason);

	///心跳超时警告。当长时间未收到报文时，该方法被调用。
	void OnHeartBeatWarning(int nTimeLapse);

	///登出请求响应
	void OnRspUserLogout(CThostFtdcUserLogoutField *pUserLogout, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///投资者结算结果确认响应
	void OnRspSettlementInfoConfirm(CThostFtdcSettlementInfoConfirmField *pSettlementInfoConfirm, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///请求查询合约响应
	void OnRspQryInstrument(CThostFtdcInstrumentField *pInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///请求查询资金账户响应
	void OnRspQryTradingAccount(CThostFtdcTradingAccountField *pTradingAccount, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///请求查询投资者持仓响应
	void OnRspQryInvestorPosition(CThostFtdcInvestorPositionField *pInvestorPosition, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///报单录入请求响应
	void OnRspOrderInsert(CThostFtdcInputOrderField *pInputOrder, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///报单操作请求响应
	void OnRspOrderAction(CThostFtdcInputOrderActionField *pInputOrderAction, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast);

	///报单通知
	void OnRtnOrder(CThostFtdcOrderField *pOrder);

	///成交通知
	void OnRtnTrade(CThostFtdcTradeField *pTrade);

	// ---- 自定义函数 ---- //
public:
	bool loginFlag; // 登陆成功的标识
	void reqOrderInsert(
		TThostFtdcInstrumentIDType instrumentID,
		TThostFtdcPriceType price,
		TThostFtdcVolumeType volume,
		TThostFtdcDirectionType direction); // 个性化报单录入，外部调用
private:
	void reqUserLogin(); // 登录请求
	void reqUserLogout(); // 登出请求
	void reqSettlementInfoConfirm(); // 投资者结果确认
	void reqQueryInstrument(); // 请求查询合约
	void reqQueryTradingAccount(); // 请求查询资金帐户
	void reqQueryInvestorPosition(); // 请求查询投资者持仓
	void reqOrderInsert(); // 请求报单录入

	void reqOrderAction(CThostFtdcOrderField *pOrder); // 请求报单操作
	bool isErrorRspInfo(CThostFtdcRspInfoField *pRspInfo); // 是否收到错误信息
	bool isMyOrder(CThostFtdcOrderField *pOrder); // 是否我的报单回报
	bool isTradingOrder(CThostFtdcOrderField *pOrder); // 是否正在交易的报单
};


using namespace std;

// 链接库
#pragma comment (lib, "thostmduserapi.lib")
#pragma comment (lib, "thosttraderapi.lib")

// ---- 全局变量 ---- //
// 公共参数
TThostFtdcBrokerIDType gBrokerID = "9999";                         // 模拟经纪商代码
TThostFtdcInvestorIDType gInvesterID = "//038995";                         // 投资者账户名
TThostFtdcPasswordType gInvesterPassword = "//123123";                     // 投资者密码

// 行情参数
CThostFtdcMdApi *g_pMdUserApi = nullptr;                           // 行情指针
char gMdFrontAddr[] = "tcp://180.168.212.228:41213";               // 模拟行情前置地址
char *g_pInstrumentID[] = {"rb1910"}; // 行情合约代码列表，中、上、大、郑交易所各选一种
int instrumentNum = 1;                                             // 行情合约订阅数量 

// 交易参数
CThostFtdcTraderApi *g_pTradeUserApi = nullptr;                    // 交易指针
char gTradeFrontAddr[] = "tcp://180.168.146.187:10001";            // 模拟交易前置地址
TThostFtdcInstrumentIDType g_pTradeInstrumentID = "zn1705";        // 所交易的合约代码
TThostFtdcDirectionType gTradeDirection = THOST_FTDC_D_Sell;       // 买卖方向
TThostFtdcPriceType gLimitPrice = 22735;                           // 交易价格

int main()
{ 

	// 初始化行情线程
	cout << "初始化行情..." << endl;
	g_pMdUserApi = CThostFtdcMdApi::CreateFtdcMdApi();   // 创建行情实例
	CThostFtdcMdSpi *pMdUserSpi = new CustomMdSpi;       // 创建行情回调实例
	g_pMdUserApi->RegisterSpi(pMdUserSpi);               // 注册事件类
	g_pMdUserApi->RegisterFront(gMdFrontAddr);           // 设置行情前置地址
	g_pMdUserApi->Init();                                // 连接运行
	


	
	// 初始化交易线程
	cout << "初始化交易..." << endl;
	g_pTradeUserApi = CThostFtdcTraderApi::CreateFtdcTraderApi(); // 创建交易实例 
	CustomTradeSpi *pTradeSpi = new CustomTradeSpi;               // 创建交易回调实例
	g_pTradeUserApi->RegisterSpi(pTradeSpi);                      // 注册事件类
	g_pTradeUserApi->SubscribePublicTopic(THOST_TERT_RESTART);    // 订阅公共流
	g_pTradeUserApi->SubscribePrivateTopic(THOST_TERT_RESTART);   // 订阅私有流
	g_pTradeUserApi->RegisterFront(gTradeFrontAddr);              // 设置交易前置地址
	g_pTradeUserApi->Init();                                      // 连接运行
	

	// 等到线程退出
	g_pMdUserApi->Join();
	delete pMdUserSpi;
	g_pMdUserApi->Release();

	g_pTradeUserApi->Join();
	delete pTradeSpi;
	g_pTradeUserApi->Release(); 
	
	getchar();
	return 0;
}










#include <iostream>
#include <fstream>
#include <unordered_map>
#include "CustomMdSpi.h"




//udp send 
#include "json11.hpp"
using namespace json11;

#include <stdio.h>
#include <winsock2.h>
#pragma comment(lib, "ws2_32.lib") 

bool sendTo(const char * sendData, int length) {
	WORD socketVersion = MAKEWORD(2, 2);
	WSADATA wsaData;
	if (WSAStartup(socketVersion, &wsaData) != 0) {
		return false;
	}

	SOCKET sclient = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);

	sockaddr_in sin;
	sin.sin_family = AF_INET;
	sin.sin_port = htons(8888);
#pragma warning(disable:4996) 
	sin.sin_addr.S_un.S_addr = inet_addr("127.0.0.1");
	int len = sizeof(sin);

	sendto(sclient, sendData, length, 0, (sockaddr *)&sin, len);

	/*
	char recvData[255];
	int ret = recvfrom(sclient, recvData, 255, 0, (sockaddr *)&sin, &len);
	if (ret > 0)
	{
		recvData[ret] = 0x00;
		printf(recvData);
	}
	*/
	closesocket(sclient);
	WSACleanup();

	return true;
}
//









// ---- 全局参数声明 ---- //
extern CThostFtdcMdApi *g_pMdUserApi;            // 行情指针
extern char gMdFrontAddr[];                      // 模拟行情前置地址
extern TThostFtdcBrokerIDType gBrokerID;         // 模拟经纪商代码
extern TThostFtdcInvestorIDType gInvesterID;     // 投资者账户名
extern TThostFtdcPasswordType gInvesterPassword; // 投资者密码
extern char *g_pInstrumentID[];                  // 行情合约代码列表，中、上、大、郑交易所各选一种
extern int instrumentNum;                        // 行情合约订阅数量 

// ---- ctp_api回调函数 ---- //
// 连接成功应答
void CustomMdSpi::OnFrontConnected()
{
	std::cout << "=====建立网络连接成功=====" << std::endl;
	// 开始登录
	CThostFtdcReqUserLoginField loginReq;
	memset(&loginReq, 0, sizeof(loginReq));
	strcpy(loginReq.BrokerID, gBrokerID);
	strcpy(loginReq.UserID, gInvesterID);
	strcpy(loginReq.Password, gInvesterPassword);
	static int requestID = 0; // 请求编号
	int rt = g_pMdUserApi->ReqUserLogin(&loginReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送登录请求成功" << std::endl;
	else
		std::cerr << "--->>>发送登录请求失败" << std::endl;
}

// 断开连接通知
void CustomMdSpi::OnFrontDisconnected(int nReason)
{
	std::cerr << "=====网络连接断开=====" << std::endl;
	std::cerr << "错误码： " << nReason << std::endl;
}

// 心跳超时警告
void CustomMdSpi::OnHeartBeatWarning(int nTimeLapse)
{
	std::cerr << "=====网络心跳超时=====" << std::endl;
	std::cerr << "距上次连接时间： " << nTimeLapse << std::endl;
}

// 登录应答
void CustomMdSpi::OnRspUserLogin(
	CThostFtdcRspUserLoginField *pRspUserLogin,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====账户登录成功=====" << std::endl;
		std::cout << "交易日： " << pRspUserLogin->TradingDay << std::endl;
		std::cout << "登录时间： " << pRspUserLogin->LoginTime << std::endl;
		std::cout << "经纪商： " << pRspUserLogin->BrokerID << std::endl;
		std::cout << "帐户名： " << pRspUserLogin->UserID << std::endl;
		// 开始订阅行情
		int rt = g_pMdUserApi->SubscribeMarketData(g_pInstrumentID, instrumentNum);
		if (!rt)
			std::cout << ">>>>>>发送订阅行情请求成功" << std::endl;
		else
			std::cerr << "--->>>发送订阅行情请求失败" << std::endl;
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 登出应答
void CustomMdSpi::OnRspUserLogout(
	CThostFtdcUserLogoutField *pUserLogout,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====账户登出成功=====" << std::endl;
		std::cout << "经纪商： " << pUserLogout->BrokerID << std::endl;
		std::cout << "帐户名： " << pUserLogout->UserID << std::endl;
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 错误通知
void CustomMdSpi::OnRspError(CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (bResult)
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 订阅行情应答
void CustomMdSpi::OnRspSubMarketData(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====订阅行情成功=====" << std::endl;
		std::cout << "合约代码： " << pSpecificInstrument->InstrumentID << std::endl;
		// 如果需要存入文件或者数据库，在这里创建表头,不同的合约单独存储
		char filePath[100] = { '\0' };
		sprintf(filePath, "%s_market_data.csv", pSpecificInstrument->InstrumentID);
		std::ofstream outFile;
		outFile.open(filePath, std::ios::out); // 新开文件
		outFile << "合约代码" << ","
			<< "更新时间" << ","
			<< "最新价" << ","
			<< "成交量" << ","
			<< "买价一" << ","
			<< "买量一" << ","
			<< "卖价一" << ","
			<< "卖量一" << ","
			<< "持仓量" << ","
			<< "换手率"
			<< std::endl;
		outFile.close();
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 取消订阅行情应答
void CustomMdSpi::OnRspUnSubMarketData(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====取消订阅行情成功=====" << std::endl;
		std::cout << "合约代码： " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 订阅询价应答
void CustomMdSpi::OnRspSubForQuoteRsp(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====订阅询价成功=====" << std::endl;
		std::cout << "合约代码： " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 取消订阅询价应答
void CustomMdSpi::OnRspUnSubForQuoteRsp(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====取消订阅询价成功=====" << std::endl;
		std::cout << "合约代码： " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// 行情详情通知
void CustomMdSpi::OnRtnDepthMarketData(CThostFtdcDepthMarketDataField *pDepthMarketData)
{



	// 打印行情，字段较多，截取部分
	std::cout << "=====获得深度行情=====" << std::endl;

	Json my_json = Json::array{
		// pDepthMarketData->InstrumentID,  //合约代码
		"rb_zhuli",
		pDepthMarketData->UpdateTime,	 //时间
		pDepthMarketData->UpdateMillisec,//毫秒
		pDepthMarketData->LastPrice,	 //最新价
		pDepthMarketData->Volume,		 //成交量

		pDepthMarketData->BidPrice1,	 //盘口买1价
		pDepthMarketData->BidVolume1,	 //盘口买1量
		pDepthMarketData->AskPrice1,	 //盘口卖1价
		pDepthMarketData->AskVolume1,	 //盘口卖1量

		pDepthMarketData->BidPrice2,	 //盘口买2价
		pDepthMarketData->BidVolume2,	 //盘口买2量
		pDepthMarketData->AskPrice2,	 //盘口卖2价
		pDepthMarketData->AskVolume2,	 //盘口卖2量

		pDepthMarketData->BidPrice3,	 //盘口买3价
		pDepthMarketData->BidVolume3,	 //盘口买3量
		pDepthMarketData->AskPrice3,	 //盘口卖3价
		pDepthMarketData->AskVolume3,	 //盘口卖3量

		pDepthMarketData->BidPrice4,	 //盘口买4价
		pDepthMarketData->BidVolume4,	 //盘口买4量
		pDepthMarketData->AskPrice4,	 //盘口卖4价
		pDepthMarketData->AskVolume4,	 //盘口卖4量

		pDepthMarketData->BidPrice5,	 //盘口买5价
		pDepthMarketData->BidVolume5,	 //盘口买5量
		pDepthMarketData->AskPrice5,	 //盘口卖5价
		pDepthMarketData->AskVolume5,	 //盘口卖5量

		pDepthMarketData->OpenInterest,	 //持仓量
		pDepthMarketData->Turnover,		 //成交金额
	};
	std::string json_str = my_json.dump();

	sendTo(json_str.c_str(), json_str.size());


	std::cout << "交易日： " << pDepthMarketData->TradingDay << std::endl;
	std::cout << "交易所代码： " << pDepthMarketData->ExchangeID << std::endl;
	std::cout << "合约代码： " << pDepthMarketData->InstrumentID << std::endl;
	std::cout << "合约在交易所的代码： " << pDepthMarketData->ExchangeInstID << std::endl;
	std::cout << "最新价： " << pDepthMarketData->LastPrice << std::endl;
	std::cout << "数量： " << pDepthMarketData->Volume << std::endl;


	// 如果只获取某一个合约行情，可以逐tick地存入文件或数据库
	char filePath[100] = { '\0' };
	sprintf(filePath, "%s_market_data.csv", pDepthMarketData->InstrumentID);
	std::ofstream outFile;
	outFile.open(filePath, std::ios::app); // 文件追加写入 
	outFile << pDepthMarketData->InstrumentID << ","
		<< pDepthMarketData->UpdateTime << "." << pDepthMarketData->UpdateMillisec << ","
		<< pDepthMarketData->LastPrice << ","
		<< pDepthMarketData->Volume << ","
		<< pDepthMarketData->BidPrice1 << ","
		<< pDepthMarketData->BidVolume1 << ","
		<< pDepthMarketData->AskPrice1 << ","
		<< pDepthMarketData->AskVolume1 << ","
		<< pDepthMarketData->OpenInterest << ","
		<< pDepthMarketData->Turnover << std::endl;
	outFile.close();

	// 计算实时k线 


	// 取消订阅行情
	//int rt = g_pMdUserApi->UnSubscribeMarketData(g_pInstrumentID, instrumentNum);
	//if (!rt)
	//	std::cout << ">>>>>>发送取消订阅行情请求成功" << std::endl;
	//else
	//	std::cerr << "--->>>发送取消订阅行情请求失败" << std::endl;
}

// 询价详情通知
void CustomMdSpi::OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *pForQuoteRsp)
{
	// 部分询价结果
	std::cout << "=====获得询价结果=====" << std::endl;
	std::cout << "交易日： " << pForQuoteRsp->TradingDay << std::endl;
	std::cout << "交易所代码： " << pForQuoteRsp->ExchangeID << std::endl;
	std::cout << "合约代码： " << pForQuoteRsp->InstrumentID << std::endl;
	std::cout << "询价编号： " << pForQuoteRsp->ForQuoteSysID << std::endl;
}





#pragma   warning(disable:4996) 
#include <iostream>
#include <time.h>
#include <thread>
#include <chrono>
#include "CustomTradeSpi.h"


// ---- 全局参数声明 ---- //
extern TThostFtdcBrokerIDType gBrokerID;                      // 模拟经纪商代码
extern TThostFtdcInvestorIDType gInvesterID;                  // 投资者账户名
extern TThostFtdcPasswordType gInvesterPassword;              // 投资者密码
extern CThostFtdcTraderApi *g_pTradeUserApi;                  // 交易指针
extern char gTradeFrontAddr[];                                // 模拟交易前置地址
extern TThostFtdcInstrumentIDType g_pTradeInstrumentID;       // 所交易的合约代码
extern TThostFtdcDirectionType gTradeDirection;               // 买卖方向
extern TThostFtdcPriceType gLimitPrice;                       // 交易价格

// 会话参数
TThostFtdcFrontIDType	trade_front_id;	//前置编号
TThostFtdcSessionIDType	session_id;	//会话编号
TThostFtdcOrderRefType	order_ref;	//报单引用
time_t lOrderTime;
time_t lOrderOkTime;



void CustomTradeSpi::OnFrontConnected()
{
	std::cout << "=====建立网络连接成功=====" << std::endl;
	// 开始登录
	reqUserLogin();
}

void CustomTradeSpi::OnRspUserLogin(
	CThostFtdcRspUserLoginField *pRspUserLogin,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====账户登录成功=====" << std::endl;
		loginFlag = true;
		std::cout << "交易日： " << pRspUserLogin->TradingDay << std::endl;
		std::cout << "登录时间： " << pRspUserLogin->LoginTime << std::endl;
		std::cout << "经纪商： " << pRspUserLogin->BrokerID << std::endl;
		std::cout << "帐户名： " << pRspUserLogin->UserID << std::endl;
		// 保存会话参数
		trade_front_id = pRspUserLogin->FrontID;
		session_id = pRspUserLogin->SessionID;
		strcpy(order_ref, pRspUserLogin->MaxOrderRef);

		// 投资者结算结果确认
		reqSettlementInfoConfirm();
	}
}

void CustomTradeSpi::OnRspError(CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast)
{
	isErrorRspInfo(pRspInfo);
}

void CustomTradeSpi::OnFrontDisconnected(int nReason)
{
	std::cerr << "=====网络连接断开=====" << std::endl;
	std::cerr << "错误码： " << nReason << std::endl;
}

void CustomTradeSpi::OnHeartBeatWarning(int nTimeLapse)
{
	std::cerr << "=====网络心跳超时=====" << std::endl;
	std::cerr << "距上次连接时间： " << nTimeLapse << std::endl;
}

void CustomTradeSpi::OnRspUserLogout(
	CThostFtdcUserLogoutField *pUserLogout,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		loginFlag = false; // 登出就不能再交易了 
		std::cout << "=====账户登出成功=====" << std::endl;
		std::cout << "经纪商： " << pUserLogout->BrokerID << std::endl;
		std::cout << "帐户名： " << pUserLogout->UserID << std::endl;
	}
}

void CustomTradeSpi::OnRspSettlementInfoConfirm(
	CThostFtdcSettlementInfoConfirmField *pSettlementInfoConfirm,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====投资者结算结果确认成功=====" << std::endl;
		std::cout << "确认日期： " << pSettlementInfoConfirm->ConfirmDate << std::endl;
		std::cout << "确认时间： " << pSettlementInfoConfirm->ConfirmTime << std::endl;
		// 请求查询合约
		reqQueryInstrument();
	}
}

void CustomTradeSpi::OnRspQryInstrument(
	CThostFtdcInstrumentField *pInstrument,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====查询合约结果成功=====" << std::endl;
		std::cout << "交易所代码： " << pInstrument->ExchangeID << std::endl;
		std::cout << "合约代码： " << pInstrument->InstrumentID << std::endl;
		std::cout << "合约在交易所的代码： " << pInstrument->ExchangeInstID << std::endl;
		std::cout << "执行价： " << pInstrument->StrikePrice << std::endl;
		std::cout << "到期日： " << pInstrument->EndDelivDate << std::endl;
		std::cout << "当前交易状态： " << pInstrument->IsTrading << std::endl;
		// 请求查询投资者资金账户
		reqQueryTradingAccount();
	}
}

void CustomTradeSpi::OnRspQryTradingAccount(
	CThostFtdcTradingAccountField *pTradingAccount,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====查询投资者资金账户成功=====" << std::endl;
		std::cout << "投资者账号： " << pTradingAccount->AccountID << std::endl;
		std::cout << "可用资金： " << pTradingAccount->Available << std::endl;
		std::cout << "可取资金： " << pTradingAccount->WithdrawQuota << std::endl;
		std::cout << "当前保证金: " << pTradingAccount->CurrMargin << std::endl;
		std::cout << "平仓盈亏： " << pTradingAccount->CloseProfit << std::endl;
		// 请求查询投资者持仓
		reqQueryInvestorPosition();
	}
}

void CustomTradeSpi::OnRspQryInvestorPosition(
	CThostFtdcInvestorPositionField *pInvestorPosition,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====查询投资者持仓成功=====" << std::endl;
		if (pInvestorPosition)
		{
			std::cout << "合约代码： " << pInvestorPosition->InstrumentID << std::endl;
			std::cout << "开仓价格： " << pInvestorPosition->OpenAmount << std::endl;
			std::cout << "开仓量： " << pInvestorPosition->OpenVolume << std::endl;
			std::cout << "开仓方向： " << pInvestorPosition->PosiDirection << std::endl;
			std::cout << "占用保证金：" << pInvestorPosition->UseMargin << std::endl;
		}
		else
			std::cout << "----->该合约未持仓" << std::endl;

		// 报单录入请求（这里是一部接口，此处是按顺序执行）
		/*if (loginFlag)
			reqOrderInsert();*/
			//if (loginFlag)
			//	reqOrderInsertWithParams(g_pTradeInstrumentID, gLimitPrice, 1, gTradeDirection); // 自定义一笔交易

			// 策略交易
			//std::cout << "=====开始进入策略交易=====" << std::endl;
			//while (loginFlag)
			//	StrategyCheckAndTrade(g_pTradeInstrumentID, this);
	}
}

void CustomTradeSpi::OnRspOrderInsert(
	CThostFtdcInputOrderField *pInputOrder,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====报单录入成功=====" << std::endl;
		std::cout << "合约代码： " << pInputOrder->InstrumentID << std::endl;
		std::cout << "价格： " << pInputOrder->LimitPrice << std::endl;
		std::cout << "数量： " << pInputOrder->VolumeTotalOriginal << std::endl;
		std::cout << "开仓方向： " << pInputOrder->Direction << std::endl;
	}
}

void CustomTradeSpi::OnRspOrderAction(
	CThostFtdcInputOrderActionField *pInputOrderAction,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	if (!isErrorRspInfo(pRspInfo))
	{
		std::cout << "=====报单操作成功=====" << std::endl;
		std::cout << "合约代码： " << pInputOrderAction->InstrumentID << std::endl;
		std::cout << "操作标志： " << pInputOrderAction->ActionFlag;
	}
}

void CustomTradeSpi::OnRtnOrder(CThostFtdcOrderField *pOrder)
{
	char str[10];
	sprintf(str, "%d", pOrder->OrderSubmitStatus);
	int orderState = atoi(str) - 48;	//报单状态0=已经提交，3=已经接受

	std::cout << "=====收到报单应答=====" << std::endl;

	if (isMyOrder(pOrder))
	{
		if (isTradingOrder(pOrder))
		{
			std::cout << "--->>> 等待成交中！" << std::endl;
			//reqOrderAction(pOrder); // 这里可以撤单
			//reqUserLogout(); // 登出测试
		}
		else if (pOrder->OrderStatus == THOST_FTDC_OST_Canceled)
			std::cout << "--->>> 撤单成功！" << std::endl;
	}
}

void CustomTradeSpi::OnRtnTrade(CThostFtdcTradeField *pTrade)
{
	std::cout << "=====报单成功成交=====" << std::endl;
	std::cout << "成交时间： " << pTrade->TradeTime << std::endl;
	std::cout << "合约代码： " << pTrade->InstrumentID << std::endl;
	std::cout << "成交价格： " << pTrade->Price << std::endl;
	std::cout << "成交量： " << pTrade->Volume << std::endl;
	std::cout << "开平仓方向： " << pTrade->Direction << std::endl;
}

bool CustomTradeSpi::isErrorRspInfo(CThostFtdcRspInfoField *pRspInfo)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (bResult)
		std::cerr << "返回错误--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
	return bResult;
}

void CustomTradeSpi::reqUserLogin()
{
	CThostFtdcReqUserLoginField loginReq;
	memset(&loginReq, 0, sizeof(loginReq));
	strcpy(loginReq.BrokerID, gBrokerID);
	strcpy(loginReq.UserID, gInvesterID);
	strcpy(loginReq.Password, gInvesterPassword);
	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqUserLogin(&loginReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送登录请求成功" << std::endl;
	else
		std::cerr << "--->>>发送登录请求失败" << std::endl;
}

void CustomTradeSpi::reqUserLogout()
{
	CThostFtdcUserLogoutField logoutReq;
	memset(&logoutReq, 0, sizeof(logoutReq));
	strcpy(logoutReq.BrokerID, gBrokerID);
	strcpy(logoutReq.UserID, gInvesterID);
	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqUserLogout(&logoutReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送登出请求成功" << std::endl;
	else
		std::cerr << "--->>>发送登出请求失败" << std::endl;
}


void CustomTradeSpi::reqSettlementInfoConfirm()
{
	CThostFtdcSettlementInfoConfirmField settlementConfirmReq;
	memset(&settlementConfirmReq, 0, sizeof(settlementConfirmReq));
	strcpy(settlementConfirmReq.BrokerID, gBrokerID);
	strcpy(settlementConfirmReq.InvestorID, gInvesterID);
	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqSettlementInfoConfirm(&settlementConfirmReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送投资者结算结果确认请求成功" << std::endl;
	else
		std::cerr << "--->>>发送投资者结算结果确认请求失败" << std::endl;
}

void CustomTradeSpi::reqQueryInstrument()
{
	CThostFtdcQryInstrumentField instrumentReq;
	memset(&instrumentReq, 0, sizeof(instrumentReq));
	strcpy(instrumentReq.InstrumentID, g_pTradeInstrumentID);
	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqQryInstrument(&instrumentReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送合约查询请求成功" << std::endl;
	else
		std::cerr << "--->>>发送合约查询请求失败" << std::endl;
}

void CustomTradeSpi::reqQueryTradingAccount()
{
	CThostFtdcQryTradingAccountField tradingAccountReq;
	memset(&tradingAccountReq, 0, sizeof(tradingAccountReq));
	strcpy(tradingAccountReq.BrokerID, gBrokerID);
	strcpy(tradingAccountReq.InvestorID, gInvesterID);
	static int requestID = 0; // 请求编号
	std::this_thread::sleep_for(std::chrono::milliseconds(700)); // 有时候需要停顿一会才能查询成功
	int rt = g_pTradeUserApi->ReqQryTradingAccount(&tradingAccountReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送投资者资金账户查询请求成功" << std::endl;
	else
		std::cerr << "--->>>发送投资者资金账户查询请求失败" << std::endl;
}

void CustomTradeSpi::reqQueryInvestorPosition()
{
	CThostFtdcQryInvestorPositionField postionReq;
	memset(&postionReq, 0, sizeof(postionReq));
	strcpy(postionReq.BrokerID, gBrokerID);
	strcpy(postionReq.InvestorID, gInvesterID);
	strcpy(postionReq.InstrumentID, g_pTradeInstrumentID);
	static int requestID = 0; // 请求编号
	std::this_thread::sleep_for(std::chrono::milliseconds(700)); // 有时候需要停顿一会才能查询成功
	int rt = g_pTradeUserApi->ReqQryInvestorPosition(&postionReq, requestID);
	if (!rt)
		std::cout << ">>>>>>发送投资者持仓查询请求成功" << std::endl;
	else
		std::cerr << "--->>>发送投资者持仓查询请求失败" << std::endl;
}

void CustomTradeSpi::reqOrderInsert()
{
	CThostFtdcInputOrderField orderInsertReq;
	memset(&orderInsertReq, 0, sizeof(orderInsertReq));
	///经纪公司代码
	strcpy(orderInsertReq.BrokerID, gBrokerID);
	///投资者代码
	strcpy(orderInsertReq.InvestorID, gInvesterID);
	///合约代码
	strcpy(orderInsertReq.InstrumentID, g_pTradeInstrumentID);
	///报单引用
	strcpy(orderInsertReq.OrderRef, order_ref);
	///报单价格条件: 限价
	orderInsertReq.OrderPriceType = THOST_FTDC_OPT_LimitPrice;
	///买卖方向: 
	orderInsertReq.Direction = gTradeDirection;
	///组合开平标志: 开仓
	orderInsertReq.CombOffsetFlag[0] = THOST_FTDC_OF_Open;
	///组合投机套保标志
	orderInsertReq.CombHedgeFlag[0] = THOST_FTDC_HF_Speculation;
	///价格
	orderInsertReq.LimitPrice = gLimitPrice;
	///数量：1
	orderInsertReq.VolumeTotalOriginal = 1;
	///有效期类型: 当日有效
	orderInsertReq.TimeCondition = THOST_FTDC_TC_GFD;
	///成交量类型: 任何数量
	orderInsertReq.VolumeCondition = THOST_FTDC_VC_AV;
	///最小成交量: 1
	orderInsertReq.MinVolume = 1;
	///触发条件: 立即
	orderInsertReq.ContingentCondition = THOST_FTDC_CC_Immediately;
	///强平原因: 非强平
	orderInsertReq.ForceCloseReason = THOST_FTDC_FCC_NotForceClose;
	///自动挂起标志: 否
	orderInsertReq.IsAutoSuspend = 0;
	///用户强评标志: 否
	orderInsertReq.UserForceClose = 0;

	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqOrderInsert(&orderInsertReq, ++requestID);
	if (!rt)
		std::cout << ">>>>>>发送报单录入请求成功" << std::endl;
	else
		std::cerr << "--->>>发送报单录入请求失败" << std::endl;
}

void CustomTradeSpi::reqOrderInsert(
	TThostFtdcInstrumentIDType instrumentID,
	TThostFtdcPriceType price,
	TThostFtdcVolumeType volume,
	TThostFtdcDirectionType direction)
{
	CThostFtdcInputOrderField orderInsertReq;
	memset(&orderInsertReq, 0, sizeof(orderInsertReq));
	///经纪公司代码
	strcpy(orderInsertReq.BrokerID, gBrokerID);
	///投资者代码
	strcpy(orderInsertReq.InvestorID, gInvesterID);
	///合约代码
	strcpy(orderInsertReq.InstrumentID, instrumentID);
	///报单引用
	strcpy(orderInsertReq.OrderRef, order_ref);
	///报单价格条件: 限价
	orderInsertReq.OrderPriceType = THOST_FTDC_OPT_LimitPrice;
	///买卖方向: 
	orderInsertReq.Direction = direction;
	///组合开平标志: 开仓
	orderInsertReq.CombOffsetFlag[0] = THOST_FTDC_OF_Open;
	///组合投机套保标志
	orderInsertReq.CombHedgeFlag[0] = THOST_FTDC_HF_Speculation;
	///价格
	orderInsertReq.LimitPrice = price;
	///数量：1
	orderInsertReq.VolumeTotalOriginal = volume;
	///有效期类型: 当日有效
	orderInsertReq.TimeCondition = THOST_FTDC_TC_GFD;
	///成交量类型: 任何数量
	orderInsertReq.VolumeCondition = THOST_FTDC_VC_AV;
	///最小成交量: 1
	orderInsertReq.MinVolume = 1;
	///触发条件: 立即
	orderInsertReq.ContingentCondition = THOST_FTDC_CC_Immediately;
	///强平原因: 非强平
	orderInsertReq.ForceCloseReason = THOST_FTDC_FCC_NotForceClose;
	///自动挂起标志: 否
	orderInsertReq.IsAutoSuspend = 0;
	///用户强评标志: 否
	orderInsertReq.UserForceClose = 0;

	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqOrderInsert(&orderInsertReq, ++requestID);
	if (!rt)
		std::cout << ">>>>>>发送报单录入请求成功" << std::endl;
	else
		std::cerr << "--->>>发送报单录入请求失败" << std::endl;
}

void CustomTradeSpi::reqOrderAction(CThostFtdcOrderField *pOrder)
{
	static bool orderActionSentFlag = false; // 是否发送了报单
	if (orderActionSentFlag)
		return;

	CThostFtdcInputOrderActionField orderActionReq;
	memset(&orderActionReq, 0, sizeof(orderActionReq));
	///经纪公司代码
	strcpy(orderActionReq.BrokerID, pOrder->BrokerID);
	///投资者代码
	strcpy(orderActionReq.InvestorID, pOrder->InvestorID);
	///报单操作引用
	//	TThostFtdcOrderActionRefType	OrderActionRef;
	///报单引用
	strcpy(orderActionReq.OrderRef, pOrder->OrderRef);
	///请求编号
	//	TThostFtdcRequestIDType	RequestID;
	///前置编号
	orderActionReq.FrontID = trade_front_id;
	///会话编号
	orderActionReq.SessionID = session_id;
	///交易所代码
	//	TThostFtdcExchangeIDType	ExchangeID;
	///报单编号
	//	TThostFtdcOrderSysIDType	OrderSysID;
	///操作标志
	orderActionReq.ActionFlag = THOST_FTDC_AF_Delete;
	///价格
	//	TThostFtdcPriceType	LimitPrice;
	///数量变化
	//	TThostFtdcVolumeType	VolumeChange;
	///用户代码
	//	TThostFtdcUserIDType	UserID;
	///合约代码
	strcpy(orderActionReq.InstrumentID, pOrder->InstrumentID);
	static int requestID = 0; // 请求编号
	int rt = g_pTradeUserApi->ReqOrderAction(&orderActionReq, ++requestID);
	if (!rt)
		std::cout << ">>>>>>发送报单操作请求成功" << std::endl;
	else
		std::cerr << "--->>>发送报单操作请求失败" << std::endl;
	orderActionSentFlag = true;
}

bool CustomTradeSpi::isMyOrder(CThostFtdcOrderField *pOrder)
{
	return ((pOrder->FrontID == trade_front_id) &&
		(pOrder->SessionID == session_id) &&
		(strcmp(pOrder->OrderRef, order_ref) == 0));
}

bool CustomTradeSpi::isTradingOrder(CThostFtdcOrderField *pOrder)
{
	return ((pOrder->OrderStatus != THOST_FTDC_OST_PartTradedNotQueueing) &&
		(pOrder->OrderStatus != THOST_FTDC_OST_Canceled) &&
		(pOrder->OrderStatus != THOST_FTDC_OST_AllTraded));
}