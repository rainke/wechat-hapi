import crypto from 'crypto'
import getTicket from './getTicket';
import config from '../config';

const getNoncestr = () => Math.random().toString(36);

export default async (url: string) => {
  const jsapi_ticket = await getTicket();
  const noncestr = getNoncestr();
  const timestamp = Math.floor(Date.now() / 1000);
  const str = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
  const signature = crypto.createHash('sha1').update(str).digest('hex');
  return {noncestr, timestamp, signature, appId: config.appid}
}