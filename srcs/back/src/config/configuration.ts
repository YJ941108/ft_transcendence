/**
 * port
 * auth
 *    fortytwo
 *      id
 *      secret
 *      callback
 * client
 *    origin
 * server
 *    origin
 * jwt
 *    secret
 */
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  auth: {
    fortytwo: {
      id: process.env.FORTYTWO_APP_ID,
      secret: process.env.FORTYTWO_APP_SECRET,
      callback: process.env.FORTYTWO_APP_CALLBACK_URL,
    },
  },
  client: {
    origin: process.env.CLIENT_ORIGIN,
  },
  server: {
    origin: process.env.SERVER_ORIGIN,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
});
