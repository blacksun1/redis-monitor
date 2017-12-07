const redis = require('redis');
const chalk = require('chalk');


const MAX_COMMAND_LENGTH = 10;
let indent = '';
function monitorCommands() {

    const monitorClient  = redis.createClient();
    monitorClient.monitor(function (err, res) {
        console.log('? ' + chalk.green('Entering command monitoring mode'));
    });

    monitorClient.on('monitor', function (time, args, raw_reply) {

        const [command, ...commandArgs] = args;

        if (command === 'exec') {
            indent = ''
        }

        console.log(
            '+ ' +
            chalk.green(time) +
            ": " +
            indent +
            chalk.blue(command.slice(0, MAX_COMMAND_LENGTH) + ' '.repeat(MAX_COMMAND_LENGTH - indent.length - command.length < 0 ? 0 : MAX_COMMAND_LENGTH - indent.length - command.length)) +
            ' ' + (commandArgs[0] || '')
        );
        if (commandArgs.length > 1) {
            console.log(...commandArgs);
        }

        if (command === 'multi') {
            indent = '- ';
        }
    });
}

function monitorPublishedMessages() {
    const subscribeClient = redis.createClient();

    subscribeClient.on('psubscribe', function() {
        console.log('? ' + chalk.green('Entering published messages monitoring mode'));
    });
    subscribeClient.on('pmessage', function(pattern, channel, message) {
        console.log('* ' + chalk.red(`Published to channel: ${channel}`));
        let parsedMessage = message;
        try {
            parsedMessage = JSON.parse(message);

        } catch (err) {
            // NoOp
        }

        console.log(parsedMessage);
    });
    subscribeClient.psubscribe('*');
}

monitorCommands();
monitorPublishedMessages();
