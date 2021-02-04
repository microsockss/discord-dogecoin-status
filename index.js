const request = require('request');
const chalk = require('chalk');

const config = require('./config.json');

const SUCCESS = chalk.hex('#43B581');
const ERROR = chalk.hex('#F04747');
const WARN = chalk.hex('#FAA61A');
const PROCESS = chalk.hex('#F57731');
const INFO = chalk.hex('#FF73FA');
const LOG = chalk.hex('#44DDBF');

const URL = `https://discord.com/api/v6/users/@me/settings`;

let dogePrice = 0;

// Adds [LOG] and [dd/mm/yyyy | hh:mm:ss UTC] prefix to all console.log's
let originalConsoleLog = console.log;
console.log = function () {
    args = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');
    args.push(`${LOG(`[LOG]`)} ${INFO(`[${day}/${month}/${year} | ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleLog.apply(console, args);
}

// Adds [ERROR] and [dd/mm/yyyy | hh:mm:ss UTC] prefix to all console.error's
let originalConsoleError = console.error;
console.error = function () {
    args = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');
    args.push(`${ERROR(`[ERROR]`)} ${INFO(`[${day}/${month}/${year} | ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleError.apply(console, args);
}

setInterval(function(){ fetchPrice(); },4000) // Updates price every 4 seconds

console.log(SUCCESS(`Successfully started the application...`));

// Fetch latest dogecoin price
function fetchPrice() {
    request({
        headers: {
            Authorization: config.robinhood_token
          },
        url: `https://api.robinhood.com/marketdata/forex/quotes/1ef78e1b-049b-4f12-90e5-555dcf2fe204/`,
        json: true
    }, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            dogePrice = data.body.ask_price;
            console.log(LOG("Dogecoin price is: $" + dogePrice));
            updateStatus();
        }
    });
}

// Update custom status
function updateStatus() {
    return new Promise((resolve, reject) => {
        request({
            method: 'PATCH',
            uri: URL,
            headers: {
                Authorization: config.discord_token
            },
            json: {
                custom_status: {
                    text: "DOGE = $" + dogePrice,
                    emoji_id: config.emojiID,
                    emoji_name: config.emojiName
                }
            }
        }, (err, res) => {
            if (err) {
                return reject(ERROR(`[ERROR] ${err}`));
            }
            if (res.statusCode !== 200) {
                return reject(ERROR(`[ERROR] Invalid Status Code: ${res.statusCode}`));
            }
            resolve(true)
            console.log(LOG('[UPDATED STATUS] '));
        });
    });
}