require('dotenv').config()
let acSID=process.env.accountSID
let aToken=process.env.authToken
module.exports={

    PRODUCT_COLLECTION:'product1',
    USER_COLLECTION:'user1',
    ADMIN_COLLECTION:'admin',
    CART_COLLECTION:'cart',
    BRAND_COLLECTION:'Brand',
    ORDER_COLLECTION:'order',
    TYPE_COLLECTION:'Type',
    COUPON_COLLECTION:'coupon',
    OFFER_COLLECTION:'offers',
    ADDRESS_COLLECTION:'address',
    BANNER_COLLECTION:'banner',

    serviceID:'VA962dee21c5d3e75fdca57868742a668a',
    accountSID:acSID,
    authToken:aToken


}