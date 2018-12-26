import * as Hapi from 'hapi';
import crypto from 'crypto';

const server = new Hapi.Server({
  host: 'localhost',
  port: 4000
});

server.route({
  method:'GET',
  path:'/',
  handler:function(request,h) {
      return 'hello boy';
  }
});

interface wxQuery extends Hapi.RequestQuery {
  echostr: string;
  nonce: string;
  signature: string;
  timestamp: string;
}

server.route({
  method: 'GET',
  path: '/wx',
  handler(request, h) {
    const query = request.query as wxQuery;
    const {echostr, nonce, signature, timestamp} = query;
    const token = 'weixin';
    const tempStr  = [token, timestamp, nonce].sort().join('');
    const hashStr = crypto.createHash('sha1').update(tempStr).digest('hex');
    if(hashStr === signature) {
      return echostr;
    } else {
      return echostr;
    }
  }
});

const start = async function() {
  try {
    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
}
start();