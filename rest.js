const fs = require('fs');
const request = require('request');

const REST_HOST = '192.168.1.114:18080'
const MACAROON_PATH = './admin.macaroon'

let options = {
    url: `https://${REST_HOST}/v1/getinfo`,
    // Work-around for self-signed certificates.
    rejectUnauthorized: false,
    json: true,
    headers: {
        'Grpc-Metadata-macaroon': fs.readFileSync(MACAROON_PATH).toString('hex'),
    },
}

request.get(options, function(error, response, body) {
    if (error) {
        console.error('Ошибка запроса:', error);
    } else {
        console.log('Ответ:', body);
    }
});