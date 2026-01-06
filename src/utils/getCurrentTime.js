"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getCurrentTime = function () {
    var date_time = new Date();
    // get current date
    // adjust 0 before single digit date
    var date = date_time.getDate();
    // get current month
    var month = date_time.getMonth();
    // get current year
    var year = date_time.getFullYear();
    // get current hours
    var hours = date_time.getHours();
    // get current minutes
    var minutes = date_time.getMinutes();
    // get current seconds
    var seconds = date_time.getSeconds();
    // prints date in YYYY-MM-DD format
    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return ("[" +
        year +
        "-" +
        (month > 9 ? month : "0".concat(month)) +
        "-" +
        (date > 9 ? date : "0".concat(date)) +
        " " +
        (hours > 9 ? hours : "0".concat(hours)) +
        ":" +
        (minutes > 9 ? minutes : "0".concat(minutes)) +
        ":" +
        (seconds > 9 ? seconds : "0".concat(seconds)) +
        "]");
};
exports.default = getCurrentTime;
