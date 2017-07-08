$(function () {
    setInterval(function () {
        console.log('int');
        check()
    }, 5000);

    function check() {
        console.log('checking');
        $.get('http://127.0.0.1:3000/workerstatus', {}, function (data) {
            console.log('get');
            obj = JSON.parse(data);

            $('.mpm_status').html(obj.mpm.toString() + ' messages per minute');
            $('.worker_status').html(obj.workerconn + '/' + obj.workercount + ' worker sending');
            $('.small_status').html(obj.reconnecting + ' reconnecting');
            $('.cpm_status').html(obj.cpm.toString() + ' average mpm per worker');
        });
    }
});
