const Router = require("@koa/router");
const bodyParser = require("koa-bodyparser");
const router = new Router();

const lrProperty = require("./models/lrProperty.js");
// const lrTransactions = require("./models/lrTransactions.js");

router
  .param("lrPropertyId", async (id, ctx, next) => {
    ctx.lrProperty = await new lrProperty({ id: id }).fetch({
      withRelated: ["lrTransactions"],
      require: false,
    });

    if (!ctx.lrProperty) {
      ctx.status = 404;
      return (ctx.body = { error: true, msg: "LRProperty not found" });
    }

    return next();
  })
  .get("/", async (ctx, next) => {
    return (ctx.body = "I'm alive!");
  })
  .get("/lrProperty/:lrPropertyId", async (ctx, next) => {
    return (ctx.body = { success: true, lrProperty: ctx.lrProperty.toJSON() });
  });

router.post("/find-property", async (ctx, next) => {
  const { propertyQuery, searchBy } = ctx.request.body;
  console.log(typeof propertyQuery, searchBy);

  const searchOb = {};
  searchOb[searchBy] = propertyQuery;
  //   console.log(searchOb);
  ctx.lrProperties = await new lrProperty()
    .where(searchOb)
    .query(function (qb) {
      qb.limit(20);
    })
    .fetchAll({
      withRelated: ["lrTransactions"],
      require: false,
    });

  if (!ctx.lrProperties) {
    ctx.status = 404;
    return (ctx.body = { error: true, msg: "LRProperty not found" });
  }
  return (ctx.body = { success: true, lrProperty: ctx.lrProperties.toJSON() });
});

module.exports = (app) => {
  app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());
};
