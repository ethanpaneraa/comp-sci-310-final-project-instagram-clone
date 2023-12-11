const { S3Client } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');

const fs = require('fs');
const ini = require('ini');

const config = require('./config.js');

const instagram_config = ini.parse(fs.readFileSync(config.instagram_config, 'utf-8'));

console.log("instagram_config: ", instagram_config);

const s3_region_name = instagram_config.s3_region_name;
const s3_bucket_name = instagram_config.s3_bucket_name;

console.log("s3_region_name: ", s3_region_name);
console.log("s3_bucket_name: ", s3_bucket_name);

let s3 = new S3Client({
  region: s3_region_name,
  credentials: fromIni({ profile: config.instagram_profile })
});



module.exports = { s3, s3_bucket_name, s3_region_name };
