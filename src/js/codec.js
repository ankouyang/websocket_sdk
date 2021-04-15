(function(win) {
    const rawHeaderLen = 12;
    const verOffset = 0;
    const opOffset = 2;
    const seqOffset = 4;
    const bodyLenOffset = 8;
    const headerBuf = new ArrayBuffer(rawHeaderLen);
    const headerView = new DataView(headerBuf, 0);
    const textDecoder = new TextDecoder();
    const textEncoder = new TextEncoder();
    var heartbeatInterval = null
    const mergeArrayBuffer=function( buffer1, buffer2 ) {
        var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
        tmp.set( new Uint8Array( buffer1 ), 0 );
        tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
        return tmp.buffer;
    }
    const Codec = function(options) {}
    Codec.prototype.encode = function(op,body) {
        var bodyBuf = textEncoder.encode(body);
        headerView.setUint16(verOffset, 1);
        headerView.setUint16(opOffset, op);
        headerView.setUint32(seqOffset, 1);
        headerView.setUint32(bodyLenOffset, bodyBuf.byteLength);
        return body?mergeArrayBuffer(headerBuf,bodyBuf):headerBuf;
    }
    Codec.prototype.decode=function(buffer){
        var dataView = new DataView(buffer, 0);
        var ver = dataView.getUint16(verOffset);
        var op = dataView.getUint32(opOffset);
        var seq = dataView.getUint32(seqOffset);
        var bodyLength = dataView.getUint32(bodyLenOffset);
        var body = textDecoder.decode(buffer.slice(rawHeaderLen,buffer.byteLength));
        return {ver:ver,op:op,seq:seq,bodyLength:bodyLength,body:body?body.toString():''}

    }
    Codec.prototype.heartbeat=function(Func,status){
        if(status==='close'){
            if(heartbeatInterval){ clearInterval(heartbeatInterval);return}
        }else if(status==='start'){
            Func()
            heartbeatInterval=setInterval(Func, 60 * 1000);
        }

    }
    win['MyCodec'] = Codec;
})(window);
