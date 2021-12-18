const { v4: uuidv4 } = require("uuid");

exports.homeRoute = (req, res) => {
    res.redirect(`/home`);
}

exports.homeRouteRender = (req, res) => {
    res.render('home');
}

exports.liveroomRoute = (req, res) => {
    var randid = uuidv4()
    console.log(`liveroomRoute id: ${randid}`);
    res.redirect(`/liveroom/${randid}`);
    // res.render('liveroom', { roomId: req.roomid });
}

exports.liveroomRouteRender = (req, res) => {
    console.log(`liveroomRouteRender req.params.roomid: ${req.params.roomid}`);
    res.render("liveroom", { roomId: req.params.roomid });
}

exports.joinroomRoute = (req, res) => {
    res.render("joinroom", { roomId: req.roomid });
}

exports.joinroomRouteRender = (req, res) => {
    console.log(`joinRouteRender req.params.roomid: ${req.params.roomid}`);
    res.render("joinroom", { roomId: req.params.roomid });
}