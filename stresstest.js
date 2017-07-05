express = require('express');
app = express();
fs = require('fs');
io = require('socket.io-client');

words = require('./words.json');
console.log(words.length);


log('Starting...');
TARGET_IP = 'http://188.68.59.198:8080';
var w_amount = 20; // Workermenge
var m_amount = 0; // messages pro minute
var c_amount = 0; // commands pro minute
workers = [];
var worker_names = [];
var worker_messages = [];
//w_amount = w_amount - 1;
states = [];
factors = [];



main();


function main() {

    all_m = 0;

    function startworker() {
        var name = makeid(10);

        var id = workers.length;

        workers[id] = new worker(id, m_amount, c_amount, name);


    }
    createworkers(w_amount);

    function worker(id, m_amount, c_amount, username) {

        states[id] = 0;

        log('startig worker');

        var interval = Math.round(Math.random() * 40000);
        var factor = 60000 / interval;



        log('Starting Worker #' + id);
        var socket = io(TARGET_IP);
        socket.open();
        log(TARGET_IP);

        socket.on('connect', function () {
            log('Worker #' + id + ' connected');

            states[id] = 1;

            socket.emit('handshake', {
                username: username
            });
            socket.emit('status', 'test');
            factors[id] = factor;
        });


         this.messages = setInterval(function () {

            socket.emit('chat', {
                name: username,
                text: makemsg(14)
            });

        }, interval);



        //socket.on('event', function(data){});

        socket.on('disconnect', function () {
            states[id] = 0;
            log('Worker #' + id + ' disconnected');
            log('Worker #' + id + ' trying to reconnect');
            factors[id] = 0;
            while (this.state = 0) {
                setTimeout(socket.open(TARGET_IP), 3000);
            }
            states[id] = 2;
        });


    }
    
    worker.prototype.stop = function (){
        clearInterval(this.messages);
    }
    function createworkers (c) {
        
       var d = workers.length + c;
        console.log(d);
       for (var i = workers.length; i < d; i++) {
        var interval = Math.round(Math.random() * 40000);
           console.log(i);
        setTimeout(function () {
            startworker();
        }, interval);
    } 
        console.log(workers);
    }
    
    setInterval(function () {
        var result = 0;
        for (var i = 0; i < factors.length; i++) {
            result = result + factors[i];
        }
        log(result + ' messages per minute');
    }, 10000);

    app.listen(3000, function (err, mess) {
        log('Webapp listening on port 3000');
    });

    app.use(express.static('public'));

    app.get('/workerstatus', function (req, res) {

        var answer = {
            workercount: 0,
            workerconn: 0,
            mpm: 0,
            reconnecting: 0
        };

        for (var i = 0; i < states.length; i++) {
            var result = states[i];
            answer.workercount = answer.workercount + 1;


            if (result === 1) {
                // ist verbunden
                answer.workerconn = answer.workerconn + 1;
            } else if (result === 2) {
                answer.reconnecting = answer.reconnecting + 1;
            }
        }
        var mpm = 0;
        for (var i = 0; i < factors.length; i++) {
            mpm = mpm + factors[i];
        }
        answer.mpm = mpm;
        res.send(JSON.stringify(answer));

    });
    
    app.get('/changeworkers/:type1/:count', function (req, res) {
        var type = parseInt(req.params.type1, 10);
        var count = parseInt(req.params.count,10);
        console.log('getting');
        if (type === 1) {
            
            //Adding
            createworkers(count);
            console.log('adding');
        } else {
            console.log('deleting');
            //Deleting
            deleteworkers(count);
        }
        
    });
    
    function deleteworkers(count) {
        var count_w = workers.length;
        var count_g= workers.length - count;
        
        for (var i = workers.length - 1; i > count_g -1; i--) {
             
            workers[i].stop();
        }
        
         workers.splice(count_g, count);
        factors.splice(count_g, count);
        states.splice(count_g, count);
        //delete a;
        //delete b;
        //delete c;
    }

}

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function makemsg(length) {
    var text = '';
    for (var i = 0; i < length; i++) {
        var id = Math.round(Math.random()*1000);
        text = text + ' ' + words[id];
    }
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
