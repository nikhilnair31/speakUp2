const express = require("express")
const route = express.Router()

const services = require('../services/render')

route.get('/', services.homeRoute);
route.get('/home', services.homeRouteRender);
route.get('/liveroom', services.liveroomRoute);
route.get('/liveroom/:roomid', services.liveroomRouteRender);
route.get('/joinroom', services.joinroomRoute);
route.get('/joinroom/:roomid', services.joinroomRouteRender);

module.exports = route