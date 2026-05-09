import { neon } from "@neondatabase/serverless";

let _sql = null;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Add it to your .env file or Vercel environment variables."
      );
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

const sql = new Proxy(
  function sql(strings, ...values) {
    return getSql()(strings, ...values);
  },
  {
    apply(target, thisArg, args) {
      return getSql()(...args);
    },
    get(target, prop) {
      if (prop === "transaction") return (...args) => getSql().transaction(...args);
      return target[prop];
    },
  }
);

export default sql;