var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    formData = require('form-data'),
    request = require('request');


var server = http.createServer(function(req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            console.log(fields);
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
    }
}).listen(8080);

request.post('http://127.0.0.1:8080/upload').form({key:'value'});


var form = new formData();
form.append('name', 'hefangshi');
form.append('passwd', 'what');

form.pipe(request.post('http://127.0.0.1:8080/upload'));
//server.close();