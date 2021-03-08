require('dotenv').config();

console.clear();

// Modules
const path = require('path');
const SSAPI = require('ssapi-node');
const tmi = require('tmi.js');
const ssapi = new SSAPI();
const express = require('express');
const app = express();

// Settings
let channelToConnectTo = process.env.CHANNEL;
let queueOpen = process.env.QUEUE_OPEN == "true" ? true : false;
let queueSubonly = process.env.QUEUE_SUBONLY == "true" ? true : false;
let useCooldown = process.env.USE_COOLDOWN == "true" ? true : false;
let queueCooldown = parseInt(process.env.COOLDOWN_LENGTH);

let channelQueue = [];
let cooldownList = [];

// Bot Setup
const twitchClient = new tmi.Client({
    connection: {
        secure: true,
        reconnect: true
    },
	identity: {
		username: channelToConnectTo,
		password: process.env.TWITCH_OAUTH_TOKEN
	},
    channels: [ channelToConnectTo ]
});

twitchClient.connect();

twitchClient.on('connected', () => {
    console.log(`Successfully connected to ${channelToConnectTo}`);

    // Announce the queue command when ready if the queue is open
    if(queueOpen) {
        twitchClient.say(channelToConnectTo, `You can now add SpinShare charts by using the !add command!`);
    }
});

// Add Event
twitchClient.on('message', (channel, tags, message, self) => {
    if(self) return;

    if(message.includes("!queue")) {
        twitchClient.say(channel, `@${user} There are currently ${channelQueue.length} charts in the queue. Add one with !add`);
    }

    if(message.includes("!add")) {
        // Parse message
        let splitMessage = message.split("!add");

        let ssid = splitMessage[1];
        let user = tags.username;

        if(ssid == "") {
            twitchClient.say(channel, `@${user} You have to provide a chart id. Example: !add 3`);
            return;
        }

        // Queue Closed
        if(!queueOpen) {
            twitchClient.say(channel, `@${user} Sorry, but the queue is currently closed!`);
            return;
        }

        // Subonly and user is no sub
        if(queueSubonly && (tags.badges.subscriber == undefined && tags.badges.founder == undefined && tags.badges.broadcaster == undefined)) {
            twitchClient.say(channel, `@${user} Sorry, but the queue is currenly in subscriber-only mode!`);
            return;
        }

        // Still in Cooldown
        if(useCooldown) {
            if(cooldownList.includes(user)) {
                twitchClient.say(channel, `@${user} Please wait ${queueCooldown}s between entries.`);
                return;
            }
        }

        // Find Chart with provided ID
        ssapi.getOpenData("song/" + ssid).then(data => {
            let isAlreadyInQueue = false;

            if(data.id == undefined) {
                twitchClient.say(channel, `Sorry, but this chart doesn't seem to exist!`);
                return;
            }

            // Check if already in Queue
            channelQueue.forEach(queueItem => {
                if(data.id == queueItem.chart.id) {
                    isAlreadyInQueue = true;
                }
            });

            if(isAlreadyInQueue) {
                twitchClient.say(channel, `@${user} "${data.title}" is already in the queue.`);
                return;
            }

            // Add to Queue
            channelQueue.push({chart: data, user: user, addedTime: new Date().now / 1000});

            // Add to Cooldown list
            if(useCooldown) {
                cooldownList.push(user);

                // Remove from cooldown after provided time
                setTimeout(function() {
                    cooldownList.splice(cooldownList.indexOf(user), 1);
                }, queueCooldown * 1000);
            }

            twitchClient.say(channel, `${data.title} was added to the queue. (Current length: ${channelQueue.length})`);
        });
    }
});

// Website Setup
app.use(express.static('public'));
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile( path.join(__dirname, "..", "public", "index.htm") );
});
app.get('/api/remove/:id', (req, res) => {
    if(channelQueue[req.params.id] == undefined) {
        res.sendStatus(404);
        return;
    }

    channelQueue.splice(req.params.id, 1);

    res.send( JSON.stringify(channelQueue) );
});
app.get('/api/settings', (req, res) => {
    res.send( JSON.stringify({
        queueOpen: queueOpen,
        queueSubonly: queueSubonly,
        useCooldown: useCooldown,
        queueCooldown: queueCooldown
    }) );
});
app.post('/api/settings', (req, res) => {
    if(req.body.queueOpen) {
        queueOpen = req.body.queueOpen;
    }
    if(req.body.queueSubonly) {
        queueSubonly = req.body.queueSubonly;
    }
    if(req.body.useCooldown) {
        useCooldown = req.body.useCooldown;
    }
    if(req.body.queueCooldown) {
        queueCooldown = req.body.queueCooldown;
    }

    res.sendStatus(200);
});
app.get('/api/queue', (req, res) => {
    res.send( JSON.stringify(channelQueue) );
});
let webclient = app.listen(process.env.WEBCLIENT_PORT, function () {
    console.log("---------------------------------------------------------------------");
    console.log(`Go to the webclient at http://localhost:${process.env.WEBCLIENT_PORT}`);
    console.log("---------------------------------------------------------------------");
});