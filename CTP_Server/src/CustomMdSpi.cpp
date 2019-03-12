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

bool sendTo(const char * sendData,int length){
	WORD socketVersion = MAKEWORD(2, 2);
	WSADATA wsaData;
	if (WSAStartup(socketVersion, &wsaData) != 0){
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







 

// ---- ȫ�ֲ������� ---- //
extern CThostFtdcMdApi *g_pMdUserApi;            // ����ָ��
extern char gMdFrontAddr[];                      // ģ������ǰ�õ�ַ
extern TThostFtdcBrokerIDType gBrokerID;         // ģ�⾭���̴���
extern TThostFtdcInvestorIDType gInvesterID;     // Ͷ�����˻���
extern TThostFtdcPasswordType gInvesterPassword; // Ͷ��������
extern char *g_pInstrumentID[];                  // �����Լ�����б��С��ϡ���֣��������ѡһ��
extern int instrumentNum;                        // �����Լ�������� 

// ---- ctp_api�ص����� ---- //
// ���ӳɹ�Ӧ��
void CustomMdSpi::OnFrontConnected()
{
	std::cout << "=====�����������ӳɹ�=====" << std::endl;
	// ��ʼ��¼
	CThostFtdcReqUserLoginField loginReq;
	memset(&loginReq, 0, sizeof(loginReq));
	strcpy(loginReq.BrokerID, gBrokerID);
	strcpy(loginReq.UserID, gInvesterID);
	strcpy(loginReq.Password, gInvesterPassword);
	static int requestID = 0; // ������
	int rt = g_pMdUserApi->ReqUserLogin(&loginReq, requestID);
	if (!rt)
		std::cout << ">>>>>>���͵�¼����ɹ�" << std::endl;
	else
		std::cerr << "--->>>���͵�¼����ʧ��" << std::endl;
}

// �Ͽ�����֪ͨ
void CustomMdSpi::OnFrontDisconnected(int nReason)
{
	std::cerr << "=====�������ӶϿ�=====" << std::endl;
	std::cerr << "�����룺 " << nReason << std::endl;
}

// ������ʱ����
void CustomMdSpi::OnHeartBeatWarning(int nTimeLapse)
{
	std::cerr << "=====����������ʱ=====" << std::endl;
	std::cerr << "���ϴ�����ʱ�䣺 " << nTimeLapse << std::endl;
}

// ��¼Ӧ��
void CustomMdSpi::OnRspUserLogin(
	CThostFtdcRspUserLoginField *pRspUserLogin, 
	CThostFtdcRspInfoField *pRspInfo, 
	int nRequestID, 
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====�˻���¼�ɹ�=====" << std::endl;
		std::cout << "�����գ� " << pRspUserLogin->TradingDay << std::endl;
		std::cout << "��¼ʱ�䣺 " << pRspUserLogin->LoginTime << std::endl;
		std::cout << "�����̣� " << pRspUserLogin->BrokerID << std::endl;
		std::cout << "�ʻ����� " << pRspUserLogin->UserID << std::endl;
		// ��ʼ��������
		int rt = g_pMdUserApi->SubscribeMarketData(g_pInstrumentID, instrumentNum);
		if (!rt)
			std::cout << ">>>>>>���Ͷ�����������ɹ�" << std::endl;
		else
			std::cerr << "--->>>���Ͷ�����������ʧ��" << std::endl;
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// �ǳ�Ӧ��
void CustomMdSpi::OnRspUserLogout(
	CThostFtdcUserLogoutField *pUserLogout,
	CThostFtdcRspInfoField *pRspInfo, 
	int nRequestID, 
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====�˻��ǳ��ɹ�=====" << std::endl;
		std::cout << "�����̣� " << pUserLogout->BrokerID << std::endl;
		std::cout << "�ʻ����� " << pUserLogout->UserID << std::endl;
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ����֪ͨ
void CustomMdSpi::OnRspError(CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (bResult)
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ��������Ӧ��
void CustomMdSpi::OnRspSubMarketData(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument, 
	CThostFtdcRspInfoField *pRspInfo, 
	int nRequestID, 
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====��������ɹ�=====" << std::endl;
		std::cout << "��Լ���룺 " << pSpecificInstrument->InstrumentID << std::endl;
		// �����Ҫ�����ļ��������ݿ⣬�����ﴴ����ͷ,��ͬ�ĺ�Լ�����洢
		char filePath[100] = {'\0'};
		sprintf(filePath, "%s_market_data.csv", pSpecificInstrument->InstrumentID);
		std::ofstream outFile;
		outFile.open(filePath, std::ios::out); // �¿��ļ�
		outFile << "��Լ����" << ","
			<< "����ʱ��" << ","
			<< "���¼�" << ","
			<< "�ɽ���" << ","
			<< "���һ" << ","
			<< "����һ" << ","
			<< "����һ" << ","
			<< "����һ" << ","
			<< "�ֲ���" << ","
			<< "������"
			<< std::endl;
		outFile.close();
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ȡ����������Ӧ��
void CustomMdSpi::OnRspUnSubMarketData(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument, 
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID, 
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====ȡ����������ɹ�=====" << std::endl;
		std::cout << "��Լ���룺 " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ����ѯ��Ӧ��
void CustomMdSpi::OnRspSubForQuoteRsp(
	CThostFtdcSpecificInstrumentField *pSpecificInstrument,
	CThostFtdcRspInfoField *pRspInfo,
	int nRequestID,
	bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====����ѯ�۳ɹ�=====" << std::endl;
		std::cout << "��Լ���룺 " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ȡ������ѯ��Ӧ��
void CustomMdSpi::OnRspUnSubForQuoteRsp(CThostFtdcSpecificInstrumentField *pSpecificInstrument, CThostFtdcRspInfoField *pRspInfo, int nRequestID, bool bIsLast)
{
	bool bResult = pRspInfo && (pRspInfo->ErrorID != 0);
	if (!bResult)
	{
		std::cout << "=====ȡ������ѯ�۳ɹ�=====" << std::endl;
		std::cout << "��Լ���룺 " << pSpecificInstrument->InstrumentID << std::endl;
	}
	else
		std::cerr << "���ش���--->>> ErrorID=" << pRspInfo->ErrorID << ", ErrorMsg=" << pRspInfo->ErrorMsg << std::endl;
}

// ��������֪ͨ
void CustomMdSpi::OnRtnDepthMarketData(CThostFtdcDepthMarketDataField *pDepthMarketData)
{

	

	// ��ӡ���飬�ֶν϶࣬��ȡ����
	std::cout << "=====����������=====" << std::endl;

	Json my_json = Json::array{ 
		pDepthMarketData->InstrumentID,  //��Լ����
		pDepthMarketData->UpdateTime,	 //ʱ��
		pDepthMarketData->UpdateMillisec,//����
		pDepthMarketData->LastPrice,	 //���¼�
		pDepthMarketData->Volume,		 //�ɽ���
		pDepthMarketData->BidPrice1,	 //�̿����
		pDepthMarketData->BidVolume1,	 //�̿�����
		pDepthMarketData->AskPrice1,	 //�̿�����
		pDepthMarketData->AskVolume1,	 //�̿�����
		pDepthMarketData->OpenInterest,	 //�ֲ���
		pDepthMarketData->Turnover,		 //�ɽ����
	};
	std::string json_str = my_json.dump();

	sendTo(json_str.c_str(), json_str.size());


	std::cout << "�����գ� " << pDepthMarketData->TradingDay << std::endl;
	std::cout << "���������룺 " << pDepthMarketData->ExchangeID << std::endl;
	std::cout << "��Լ���룺 " << pDepthMarketData->InstrumentID << std::endl;
	std::cout << "��Լ�ڽ������Ĵ��룺 " << pDepthMarketData->ExchangeInstID << std::endl;
	std::cout << "���¼ۣ� " << pDepthMarketData->LastPrice << std::endl;
	std::cout << "������ " << pDepthMarketData->Volume << std::endl;


	// ���ֻ��ȡĳһ����Լ���飬������tick�ش����ļ������ݿ�
	char filePath[100] = {'\0'};
	sprintf(filePath, "%s_market_data.csv", pDepthMarketData->InstrumentID);
	std::ofstream outFile;
	outFile.open(filePath, std::ios::app); // �ļ�׷��д�� 
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

	// ����ʵʱk�� 


	// ȡ����������
	//int rt = g_pMdUserApi->UnSubscribeMarketData(g_pInstrumentID, instrumentNum);
	//if (!rt)
	//	std::cout << ">>>>>>����ȡ��������������ɹ�" << std::endl;
	//else
	//	std::cerr << "--->>>����ȡ��������������ʧ��" << std::endl;
}

// ѯ������֪ͨ
void CustomMdSpi::OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *pForQuoteRsp)
{
	// ����ѯ�۽��
	std::cout << "=====���ѯ�۽��=====" << std::endl;
	std::cout << "�����գ� " << pForQuoteRsp->TradingDay << std::endl;
	std::cout << "���������룺 " << pForQuoteRsp->ExchangeID << std::endl;
	std::cout << "��Լ���룺 " << pForQuoteRsp->InstrumentID << std::endl;
	std::cout << "ѯ�۱�ţ� " << pForQuoteRsp->ForQuoteSysID << std::endl;
}