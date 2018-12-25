import * as Hapi from 'hapi';

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