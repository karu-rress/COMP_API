const http = require('http');

const PORT = 8080;
const server = http.createServer(serverCallback).listen(PORT);

// 파일로 저장 요망

let compInfo = {};

server.on('listening', () => { console.log(`Opened in ${PORT}`); });
server.on('error', () => { console.error('Error!'); });

function serverCallback(req, res) {
    if (req.method === 'GET') {
        try {
            if (Object.keys(compInfo).length === 0) {
                res.writeHead(404, { 'Content-Type' : 'text/html; charset=utf-8' });
                res.end('Value not set.');
            }
            else {
                res.writeHead(404, { 'Content-Type' : 'text/html; charset=utf-8' });
                res.end(JSON.stringify(compInfo, null, 2));
            }
        } catch (err) {

        }
    }
    else if (req.method === 'POST') {
        let body = '';
        if (req.url === '/') {
            req.on('data', data => { body = data; });
            return req.on('end', () => {
                compInfo = JSON.parse(body);
                res.writeHead(201, { 'Content-Type' : 'text/html; charset=utf-8' });
			    res.end('Assigned value successfully.');
            });
        }
        // GET 요청 시 데이터가 변해선 안됨. 따라서 POST.
        else if (req.url === '/member') {
            req.on('data', data => { body = data; });
            return req.on('end', () => {
                const { clubMembers } = JSON.parse(body);
                compInfo.clubMembers = compInfo.clubMembers.concat(clubMembers);
                res.writeHead(201, { 'Content-Type' : 'text/html; charset=utf-8' });
			    res.end('Appended members successfully.');
            });
        }
    }
}