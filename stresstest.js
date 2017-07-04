express = require('express');
webapp = express();
webserver = require('http').createServer(webapp);
fs = require('fs');
io = require('socket.io-client');

log('Starting...');
TARGET_IP = 'http://188.68.59.198:8080';
var w_amount = 500; // Workermenge
var m_amount = 0; // messages pro minute
var c_amount = 0; // commands pro minute
var workers = [];
var worker_names = [];
var worker_messages = [];



//setTimeout({}, 3000;

main();


function main() {
    all_m = 0;
    function startworker() {
        var name = makeid(10);

        var id = workers.length;

        workers[id] = worker(id, m_amount, c_amount, name);


    }
    startworker();

    function worker(id, m_amount, c_amount, username) {
        var interval = Math.round(Math.random() * 40000);
        var factor = 60000/interval;

        
        state = 0;

        log('Starting Worker #' + id.toString());
        var socket = io(TARGET_IP);
        socket.open();
        log(TARGET_IP);

        socket.on('connect', function () {
            log('Worker #' + id + ' connected');
            state = 1;

            socket.emit('handshake', {
                username: username
            });
            socket.emit('status', 'test');
                    all_m = all_m + factor;

        });


        messages = setInterval(function () {

            socket.emit('chat', {
                name: username,
                text: makeid(80)
            });


        }, interval);
        


        //socket.on('event', function(data){});

        socket.on('disconnect', function () {
            state = 0;
            log('Worker #' + id + ' disconnected');
            log('Worker #' + id + ' trying to reconnect');
            all_m = all_m - factor;
            while (state = 0) {setTimeout(socket.open(TARGET_IP),3000);}
            state = 2;
        });
    }
    for (var i = 0; i < w_amount; i++) {
         var interval = Math.round(Math.random() * 40000);
        setTimeout(startworker(),interval);
    }
    setInterval(function () {
        log(all_m + ' messages per minute');
    },10000);
}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}



function log(event) {

    // Getting timestamp
    var timestamp = new Date();

    // Creating log message
    var logging = '[' + timestamp.getHours() + ':' + timestamp.getMinutes() + '.' + timestamp.getSeconds() + '] ' + event;

    // Console logging and writing into file logs.txt
    console.log(logging);
    fs.appendFile('logs/logs.txt', logging + '\r\n', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}
