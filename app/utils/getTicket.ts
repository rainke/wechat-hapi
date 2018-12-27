import wreck from 'wreck';
import Url from 'url';
import fs from 'fs';
import util from 'util';
import path from 'path';
import getAccessToken from './getAccessToken';

const stat = util.promisify(fs.stat);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const FILE_PATH = path.resolve(__dirname, 'jsapi_ticket.txt');

export default async () => {
  const status = await stat(FILE_PATH);
  const offsetMs = Date.now() - status.mtimeMs;

  if (offsetMs >= 7200 * 1000) {
    let accessToken = await getAccessToken();
    const baseUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
    const params = {
      type: 'jsapi',
      access_token: accessToken
    };
    const url = baseUrl + '?' + new Url.URLSearchParams(params).toString();
    const {payload} = await wreck.get(url, {});
    const data = JSON.parse(payload.toString());
    const ticket: string = data.ticket;
    await writeFile(FILE_PATH, ticket);
    return ticket;
  } else {
    const ticket = await readFile(FILE_PATH);
    return ticket.toString();
  }
};
