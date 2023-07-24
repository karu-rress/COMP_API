/**
 * 
 *  COMP_API by karu-rress
 * 
 *  Created: 2023-07-24
 *  Last modified: 2023-07-24
 * 
 */


// Import required modules
const http = require('http');
const { writer } = require('repl');
const fs = require('fs').promises;

// Server and port definition
const PORT = 8080;
const server = http.createServer(serverCallback).listen(PORT);

// Run server
server.on('listening', () => { console.log(`Opened in ${PORT}`); });
server.on('error', () => { console.error('Error!'); });


/**
 * Callback function used in http.createServer() method.
 * @param {http.IncomingMessage} request 
 * @param {http.ServerResponse} response 
 * @returns 
 */
async function serverCallback(request, response) {
    const path = './comp.json';
    const header = { 'Content-Type' : 'text/html; charset=utf-8' };
    let compInfo = {};

    /** @type { (code: number, message: string) => void } */
    const writeResult = (code, message) => {
        response.writeHead(code, header);
        response.end(message); 
    };

    if (request.method === 'GET') {
        try {
            // Check if file exists
            await fs.access(path, fs.constants.F_OK);

            writeResult(200, (await fs.readFile(path)).toString());
        } catch (error) {
            writeResult(404, "Not initialized.");
        }
    }
    else if (request.method === 'POST') {
        let body = '';
        if (request.url === '/') {
            request.on('data', data => { body = data; });
            return request.on('end', async () => {
                compInfo = JSON.parse(body);

                // Input validation
                if (!["clubName", "clubLocation", "clubMembers"].every(key => key in compInfo)) {
                    writeResult(422, "clubName, clubLocation, clubMembers are required.");
                } else {


                    await fs.writeFile(path, JSON.stringify(compInfo, null, 4));
                    writeResult(201, "Initialized successfully.");
                }
            });
        }
        // GET method should NOT modify data. Using POST instead.
        else if (request.url === '/member') {
            request.on('data', data => { body = data; });
            return request.on('end', async () => {
                compInfo = JSON.parse((await fs.readFile(path)).toString())
                const newMember = JSON.parse(body);

                // Input validation
                if (!("clubMembers" in newMember)) {
                    writeResult(422, `Use '{ "clubMembers": [...] }' format.`);
                } else {
                    // Append new members
                    compInfo.clubMembers = compInfo.clubMembers.concat(newMember.clubMembers);

                    // Save
                    await fs.writeFile(path, JSON.stringify(compInfo, null, 4));
                    writeResult(201, "Added members successfully.");
                }
            });
        }
        else 
            writeResult(404, "Unknown URL.");
    }
    else 
        writeResult(400, "Unsupported request method.");
}