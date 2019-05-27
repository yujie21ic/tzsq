 


// let request = require('request')
// let url = 'https://dataapi.joinquant.com/apis'
// let requestData = {
//     'method': 'get_token',
//     'mob': '19806580665',
//     'pwd': 'fc123456'
// }


// request({
//     url: url,
//     method: 'POST',
//     body: JSON.stringify(requestData)
// }, (error, response, token) => {

//     console.log('token', error, response, token)

//     let requestData = {
//         "method": "get_ticks",
//         token,
//         "code": "000001.XSHE",
//         "count": 15,
//         "end_date": "2018-07-03"

//     }
//     request({
//         url: url,
//         method: 'POST',
//         body: JSON.stringify(requestData)
//     }, function (error, response, body) {
//         console.log('get_security_info', error, response, body)
//     })
// }) 