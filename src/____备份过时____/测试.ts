 


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




// import * as parse from 'csv-parse'
// import * as fs from 'fs'

// document.body.ondrop = e => {
//     e.stopPropagation()
//     e.preventDefault()

//     console.log('e.dataTransfer', e.dataTransfer)

//     console.log('e.files', e.dataTransfer!.files)

//     console.log('e.files[0]', e.dataTransfer!.files[0])

//     const path = e.dataTransfer!.files[0].path

//     console.log('path', path)

//     const str = fs.readFileSync(path, { encoding: 'utf-8' }).toString()

//     parse(str, {}, (err, records) => {
//         console.log(err, records)
//     })
// }