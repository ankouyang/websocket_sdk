(function(win) {
    var ws = null
    var codec = new MyCodec();
    var  heartbeat_num=0;
    var Client = function(options) {
        var MAX_CONNECT_TIMES = 10;
        var DELAY = 30000;
        this.options = options || {};
        if(this.options.wsUrl){
            var t= this.options.wsUrl.split(":")[0];
            switch (t) {
                case"ws":this.options.token?this.createConnect(MAX_CONNECT_TIMES, DELAY):alert('无效token'); break;
                default:alert('无效wsUrl');
            }
        }else {
            alert('无效wsUrl')
        }
    }
    Client.prototype.createConnect = function(max, delay) {
        var self = this;
        if (max === 0) {
            return;
        }
        connect();
        function connect() {
            try {
                if ('WebSocket' in window) {
                    ws = new WebSocket(self.options.wsUrl)
                    ws.binaryType = 'arraybuffer';
                } else {
                    alert('您的浏览器不支持websocket协议,建议使用新版谷歌、火狐等浏览器，请勿使用IE10以下浏览器，360浏览器请使用极速模式，不要使用兼容模式！"')
                }
            } catch (e) {
                console.log('catch')
            }
            if(heartbeat_num===3){
                heartbeat_num=0
                ws.close()
                reConnect()
            }
            ws.onopen = function() {
                auth();
            }
            ws.onmessage = function(evt) {
                var data = codec.decode(evt.data);
                switch(data.op) {
                    case 5:
                        codec.heartbeat(startHeart,'start')
                        break;
                    case 3:
                        heartbeat_num=0 // 清空
                        console.log("receive: heartbeat");
                        break;
                    default:
                        messageReceived(data.ver, data.body);
                        break
                }
            }
            ws.onclose = function() {
                codec.heartbeat(startHeart,'close')
                setTimeout(reConnect, delay);
            }
            function startHeart() {
                heartbeat_num++
                ws.send(codec.encode(2))
            }
            function auth() {
                var token = self.options.token
                if(token){ ws.send(codec.encode(4,token))}
            }
            function messageReceived(ver, body){
                var notify = self.options.notify;
                if(notify) notify(body);
            }
        }
        function sendAjaxMessage(){
            var data = {
                target_type: "users",
                target: ["5e78b949b27040b5fc7a58c0"],
                msg: {type:'txt',msg:'测试'},
                from:'5e79ad4ff83654bca135413f',
            }
            $.ajax({
                header:{
                    "content-type":"text/plain; charset=utf-8"
                },
                type:'POST',
                url:'http://192.168.0.182:8080/messages',
                data:JSON.stringify(data),
                async:false,
                success:function (msg) {

                },error:function (er) {

                }
            });
        }
        function reConnect() {
            self.createConnect(--max, delay * 2);
        }
    }
    win['MyClient'] = Client;
})(window);
