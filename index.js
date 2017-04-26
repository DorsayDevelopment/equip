const
  Koa = require('koa'),
  app = new Koa(),
  Router = require('koa-router'),
  bodyParser = require('koa-bodyparser'),
  serve = require('koa-static'),
  dbConnect = require('camo').connect,
  Subscriber = require('./Subscriber');

const dbUri = 'mongodb://localhost:27017/equip';

var db;
dbConnect(dbUri).then(connected => {
  db = connected;
});

app.use(bodyParser());
app.use(serve(__dirname + '/public'))

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

const router = new Router();

router.post('/subscribers', async ctx => {
  const email = ctx.request.body.email;
  let exists = await Subscriber.count({email});
  if(exists) {
    ctx.status = 409;
    return;
  }
  let subscriber = Subscriber.create({
    email,
    date: new Date()
  });
  const s = await subscriber.save();
  ctx.status = 200;
});

router.get('/subscribers', async ctx => {
  ctx.body = await Subscriber.find({});
});

router.get('/subscribers/count', async ctx => {
  ctx.body = await Subscriber.count({});
});

router.delete('/subscribers', async ctx => {
  await Subscriber.deleteMany({});
  ctx.status = 200;
});

router.get('/', async ctx => {
  await send(ctx, ctx.path, {
    root: __dirname + '/public'
  });
});


app.use(router.middleware());

app.listen(9000);