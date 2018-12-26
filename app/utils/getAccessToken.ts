import wreck from 'wreck';
import Url from 'url';
import fs from 'fs';
import util from 'util';
import config from '../config';

const stat = util.promisify(fs.stat);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const FILE_PATH = './access_token.txt';

export default async () => {
  const status = await stat(FILE_PATH);
  const offsetMs = Date.now() - status.mtimeMs;
  if (offsetMs > 7200 * 1000) {
    // 过期了
    const baseUrl = 'https://api.weixin.qq.com/cgi-bin/token';
    const params = {
      grant_type: 'client_credential',
      appid: config.appid,
      secret: config.appsecret
    };
    const url = baseUrl + '?' + new Url.URLSearchParams(params).toString();
    const {payload} = await wreck.get(url, {});
    const data = JSON.parse(payload.toString());
    const token = data.access_token;
    await writeFile(FILE_PATH, token);
    return token;
  } else {
    const token = await readFile(FILE_PATH);
    return token.toString();
  }
};
