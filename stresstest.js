express = require('express');
app = express();
fs = require('fs');
io = require('socket.io-client');

words = require('./words.json');


log('Starting...');
TARGET_IP = 'http://188.68.59.198:8080';
//TARGET_IP = 'http://127.0.0.1:8080';
var w_amount = 20; // Workermenge
var m_amount = 0; // messages pro minute
var c_amount = 0; // commands pro minute
workers = [];
var worker_names = [];
var worker_messages = [];
//w_amount = w_amount - 1;
states = [];
factors = [];
avg = 0;
m_multiplier = 1;


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
        var self = this;
        states[id] = 0;
        self.username = username;
        self.stop = false;
        
        self.interval = getInterval(); 
       
        avg = avg + self.interval;
        //var interval = 20000;
        var factor = 60000 / self.interval*m_multiplier;



        log('Starting Worker #' + id);
        self.socket = io(TARGET_IP);
        self.socket.open();
        log(TARGET_IP);

        self.socket.on('connect', function () {
            log('Worker #' + id + ' connected');

            states[id] = 1;

            self.socket.emit('handshake', {
                username: self.username
            });
            self.socket.emit('status', 'test');
            factors[id] = factor;
        });

            self.sendmessage();

         


        //socket.on('event', function(data){});

        self.socket.on('disconnect', function () {
            states[id] = 0;
            log('Worker #' + id + ' disconnected');
            log('Worker #' + id + ' trying to reconnect');
            factors[id] = 0;
            while (self.state = 0) {
                setTimeout(self.socket.open(TARGET_IP), 3000);
            }
            states[id] = 2;
        });


    }
    //2.565
    worker.prototype.stop = function (){
                var self = this;

        self.stop = true;
    }
    worker.prototype.sendmessage = function () {
                var self = this;

        setTimeout(function () {
           self.socket.emit('chat', {
                name: self.username,
                text: makemsg(14)
            }); 
             if (!self.stop) {
        self.sendmessage();
        }
        }, self.interval / m_multiplier);
       
    }
    function createworkers (c) {
        
       var d = workers.length + c;
       for (var i = workers.length; i < d; i++) {
        var interval = Math.round(Math.random() * 80000);
        setTimeout(function () {
            startworker();
        }, interval);
    } 
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
            reconnecting: 0,
            cpm: 0
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
        answer.cpm = mpm/workers.length;
        res.send(JSON.stringify(answer));

    });
    
    app.get('/changeworkers/:type1/:count', function (req, res) {
        var type = parseInt(req.params.type1, 10);
        var count = parseInt(req.params.count,10);
        if (type === 1) {
            
            //Adding
            createworkers(count);
        } else if (type === 2){
            //Deleting
            deleteworkers(count);
        } else if (type === 3) {
            m_multiplier = count;
            
            for (var i = 0; i < workers.length; i++) {
                factors[i] = 60000/workers[i].interval * m_multiplier;

            }
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

function getInterval() {
     var answer = 0;
            var rand = Math.round(Math.random() * 40000);
   if (rand < 13334 || rand > 26600) {
       answer = getInterval();
   } else {
       answer = rand;
   }
    
    return answer;
}
