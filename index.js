const
  Koa = require('koa'),
  app = new Koa(),
  Router = require('koa-router'),
  bodyParser = require('koa-bodyparser'),
  dbConnect = require('camo').connect,
  Subscriber = require('./Subscriber'),
  cors = require('koa-cors'),
  uuid = require('uuid/v4');

const dbUri = process.env.DB_CONNECTION || 'mongodb://localhost:27017/equip';
const port = process.env.PORT || 9000;
var UUID = uuid();

var db;
dbConnect(dbUri).then(connected => {
  db = connected;
});

app.use(bodyParser());
app.use(cors());

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
  if(exists > 0) {
    ctx.status = 201;
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
  let authToken = ctx.request.headers['token'];
  if(!authToken || authToken != UUID) {
    ctx.body = 'nope';
    return;
  } else {
    ctx.body = await Subscriber.find({});
  }
});

router.get('/subscribers/count', async ctx => {
  ctx.body = await Subscriber.count({});
});

router.get('/subscribers/email', async ctx => {
  let authToken = ctx.request.headers['token'];
  if(!authToken || authToken != UUID) {
    ctx.body = 'nope';
    return;
  } else {
    let subscribers = await Subscriber.find({}, { populate: ['email'] });
    ctx.body = subscribers.map(s => s.email);
  }
  
});

router.delete('/subscribers', async ctx => {
  let authToken = ctx.request.headers['token'];
  if(!authToken || authToken != UUID) {
    ctx.body = 'nope';
    return;
  } else {
    await Subscriber.deleteMany({});
    ctx.status = 200;
  }
});

router.get('/guid', ctx => {
  ctx.body = UUID;
});

router.post('/guid', ctx => {
  UUID = uuid();
  ctx.body = UUID;
});

app.use(router.middleware());

app.listen(port);