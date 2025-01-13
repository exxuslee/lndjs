const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const GRPC_HOST = 'localhost:10009'
const MACAROON_PATH = './admin.macaroon'
const TLS_PATH = './tls.cert'

const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
const packageDefinition = protoLoader.loadSync('./proto/lightning.proto', loaderOptions);
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const tlsCert = fs.readFileSync(TLS_PATH);
const sslCreds = grpc.credentials.createSsl(tlsCert);
const macaroon = fs.readFileSync(MACAROON_PATH).toString('hex');
console.log("macaroon: ", macaroon)
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (args, callback) {
    let metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon);
    callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let client = new lnrpc.Lightning(GRPC_HOST, creds);
let request = {};
client.getInfo(request, function (err, response) {
    console.log(response);
});
// Console output:
//  {
//    "version": <string>,
//    "commit_hash": <string>,
//    "identity_pubkey": <string>,
//    "alias": <string>,
//    "color": <string>,
//    "num_pending_channels": <uint32>,
//    "num_active_channels": <uint32>,
//    "num_inactive_channels": <uint32>,
//    "num_peers": <uint32>,
//    "block_height": <uint32>,
//    "block_hash": <string>,
//    "best_header_timestamp": <int64>,
//    "synced_to_chain": <bool>,
//    "synced_to_graph": <bool>,
//    "testnet": <bool>,
//    "chains": <Chain>,
//    "uris": <string>,
//    "features": <FeaturesEntry>,
//    "require_htlc_interceptor": <bool>,
//  }