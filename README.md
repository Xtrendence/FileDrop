# FileDrop

![Banner](./src/assets/img/Banner.png)

### Disclaimer

This was made as the coursework for my COMP3006 university module. Pull requests and major changes cannot be made until I receive a grade for this project to avoid plagiarism issues. The requirements were to develop a responsive and interactive web application that uses web sockets, Node.js, and PouchDB or MongoDB as its server-side database.

### What is FileDrop?

FileDrop is an application that allows for encrypted file sharing between two users through the use of web sockets.

### How does it work?

You download the application for the operating system you use from the [Releases](https://github.com/Xtrendence/FileDrop/releases) section, and run the app. Once you can see the IP and port of the server, it means it's working. You can then use any device on the same network to navigate to that IP and port. From there, you can choose a username and log in. Devices that are logged in would be able to see each other. At this point, you can ask for another client's permission to send them a file, or manually whitelist a client so they can send you a file whenever they wish.

### How can I host the server without using the Electron app?

Electron apps are big, no arguments there. You can simply download the source code (or ManualServer.zip from the [Releases](https://github.com/Xtrendence/FileDrop/releases) section), open a terminal in the same directory as the `package.json` file, run `npm install` followed by `npm start`. Alternatively, you can use the [Docker image](https://hub.docker.com/r/xtrendence/filedrop) (further instructions can be found in the README on DockerHub).

### How does the encryption work?

First and foremost, all encryption is done on the client-side so that the server doesn't need to be trusted. This also increases performance as encryption is a resource-intensive task, and by distributing the workload between clients, the server can transfer files as fast as possible. When the page first loads, an RSA public/private key pair is generated and stored in the browser's local storage. The public key is then broadcasted to other clients. When the user chooses a file and clicks on the upload button, the file is split into chunks of 256KB. A 256-bit AES key is then generated, and the public RSA key of the client the user is sending the file to is used to encrypt the AES key. The AES key is then used to symmetrically encrypt each chunk before sending it to the server. The encrypted AES key is sent with the encrypted chunk data as well. The other client then uses their private key to decrypt the AES key, which they can use to decrypt the chunk data. Once all the chunks have been received, they're put together to form the original file, which is then downloaded to the client's device.

### What does the app look like?

**Login Page**

![Login](https://i.imgur.com/ttK0u1m.png)

**Application Page**

![Application](https://i.imgur.com/7KbrnGv.png)

### Attributions

|Resource                     |URL                                                         |
|-----------------------------|------------------------------------------------------------|
|Login Background             |[BG Jar](https://bgjar.com/)                                |
|Main Background              |[SVG Backgrounds](https://www.svgbackgrounds.com/)          |
|Font Awesome                 |[Font Awesome](https://www.fontawesome.com/)                |
|Jest                         |[NPM](https://www.npmjs.com/package/jest)                   |
|CORS                         |[NPM](https://www.npmjs.com/package/cors)                   |
|EJS                          |[NPM](https://www.npmjs.com/package/ejs)                    |
|Express                      |[NPM](https://www.npmjs.com/package/express)                |
|Jest                         |[NPM](https://www.npmjs.com/package/jest)                   |
|Nodemon                      |[NPM](https://www.npmjs.com/package/nodemon)                |
|PouchDB                      |[NPM](https://www.npmjs.com/package/pouchdb)                |
|<span>Socket.IO</span>       |[NPM](https://www.npmjs.com/package/socket.io)              |
|<span>Socket.IO Client</span>|[NPM](https://www.npmjs.com/package/socket.io-client)       |
|SuperTest                    |[NPM](https://www.npmjs.com/package/supertest)              |
|CryptoJS                     |[NPM](https://www.npmjs.com/package/crypto-js)              |
|Forge                        |[NPM](https://www.npmjs.com/package/forge)                  |
|Puppeteer                    |[NPM](https://www.npmjs.com/package/puppeteer)              |
|Electron                     |[NPM](https://www.npmjs.com/package/electron)               |
|Electron Builder             |[NPM](https://www.npmjs.com/package/electron-builder)       |
|Electron Local Shortcut      |[NPM](https://www.npmjs.com/package/electron-localshortcut) |
