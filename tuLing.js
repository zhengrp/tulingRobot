//服务层，建立后端服务器

var http =require("http");
var url = require("url");
//文件操作模块
var fs = require("fs");
//数据请求模块
var req = require("request");

//创建服务，监听12345端口
http.createServer(function(request,response){
    //url.parse()将返回的url字符串转换为url对象
    var pathname = url.parse(request.url).pathname;
    // console.log(pathname) // /html
    // console.log(params)
    var is = isStaticFile(pathname);
    if (is){
        try {   //找到页面返回页面数据
            // 读取文件
            var data =fs.readFileSync("./page"+ pathname);
            //返回头部
            response.writeHead(200);
            //返回数据体
            response.write(data);
            response.end();
            // console.log(data.toString())
        } catch (e){    //找不到页面返回404页面
            response.writeHead(404);
            response.write("<html> <meta charset='UTF-8'> <body><h1>404 NotFound 找不到对象</h1></body></html>");
            response.end();
        }
    }else { //不是静态文件执行此部分
        // console.log(111)
        if (pathname == "/api/chat"){
                        console.log('发送请求')
            var params = url.parse(request.url,true).query;  //{ text: '***' }
            var data = {
                "reqType": 0,
                "perception": {
                    "inputText": {
                        "text": params.text
                    }
                },
                "userInfo": {
                    "apiKey": "67bb56f16d1d4cfbb02fe122da1dbef3",
                    "userId": "12345"
                }

            };
            var contents = JSON.stringify(data);
            //按接口文档传值
            req({
                url: "http://openapi.tuling123.com/openapi/api/v2",
                method: "POST",
                header: {
                    "content-type" : "application/json"    //内容类型json
                },
                body: contents
            },function(error,resp,body){
                //请求成功且状态吗200，可以吧结果返回给前端页面
                if(!error && resp.statusCode == 200){
                    // console.log(body);//{...,"results":[{"groupType":1,"resultType":"text","values":{"text":"你好，你好。"}}}
                    //设置后端跨域
                    var head = {
                        "Access-Control-Allow-Origin":"*",
                        "Access-Control-Allow-Methods":"GET",
                        "Access-Control-Allow-Headers":"x-request,content-type",
                    };
                    response.writeHead(200,head);
                //    转化为对象格式
                    var obj = JSON.parse(body);
                    if (obj && obj.results && obj.results.length > 0 && obj.results[0].values) {
                        response.write(JSON.stringify(obj.results[0].values));
                        response.end();
                    } else{
                        response.write("{\"text\":\"你说啥？\"}");
                    }   response.end();
                } else {       //返回400错误
                     response.writeHead(400)
                     response.write("数据异常")
                }    response.end();
            })

        } else {
            // console.log('error 请求')
        }
    }


}).listen(12345);

// 判断静态文件
function isStaticFile (pathname){
    var staticFile = [".html",".css",".js",".jpg",".png",".gif",".jpeg"];
    // console.log(pathname);
    for (var i = 0 ; i < staticFile.length ; i++){
        //路径包含staticFile中字符且在
        if(pathname.indexOf(staticFile[i]) == pathname.length - staticFile[i].length){
            // console.log(pathname);
            return true;
        }
    }
    return false;
}
