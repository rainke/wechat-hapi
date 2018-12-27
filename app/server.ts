import * as Hapi from 'hapi';
import inert from 'inert';
import crypto from 'crypto';
import Path from 'path';
import getAccessToken from './utils/getAccessToken';
import sign from './utils/sign';

const server = new Hapi.Server({
  host: '0.0.0.0',
  port: 4000,
  routes: {
    files: {
      relativeTo: Path.join(process.cwd(), 'public')
    }
  }
});

server.route({
  method:'GET',
  path:'/api/config',
  handler: function(request, h) {
    const url = (request.query as Hapi.RequestQuery).url || 'http://localhost:4000'
    return sign(url as string);
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
  await server.register(inert);

  server.route({
    method:'GET',
    path:'/{param*}',
    handler: {
      directory: {
        path: '.'
      }
    }
  });

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