export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  auth: {
    fortytwo: {
      id: process.env.FORTYTWO_APP_ID,
      secret: process.env.FORTYTWO_APP_SECRET,
      callback: process.env.FORTYTWO_APP_CALLBACK_URL,
    },
  },
  front: {
    origin: process.env.ORIGIN,
  },
});
