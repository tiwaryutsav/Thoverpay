export default {
  baseUrl: "https://api.cashfree.com/pg/orders",  // ✅ Production URL only
  appId: process.env.CASHFREE_APP_ID,             // From Cashfree dashboard (Production keys)
  secretKey: process.env.CASHFREE_SECRET_KEY,     // From Cashfree dashboard (Production keys)
  apiVersion: "2022-09-01",
};
