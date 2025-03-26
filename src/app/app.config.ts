export default () => ({
  port: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    accessTokenSecret: process.env.AT_SECRET,
    refreshTokenSecret: process.env.RT_SECRET,
  },
});
