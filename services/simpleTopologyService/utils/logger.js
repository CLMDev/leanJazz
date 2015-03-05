/**
*  Copyright 2014 IBM
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/
var winston = require('winston');

var loggers = {};

function getLogger(name) {
	if (!loggers[name]) {
		var logger = new winston.Logger({
			transports: [
	      		new winston.transports.Console({
	    			name: 'sts.console',
	    			level: 'info',
	    			timestamp: true,
	    			label: name,
	    			handleExceptions: true,
	    			json: false
	    		}),
	    		new winston.transports.File({
	    			name: 'sts.file.error',
	    			level: 'error',
	    			timestamp: true,
	    			label: name,
	    			filename: 'logs/error.log',
	    			handleExceptions: true,
	    			json: false,
	    			maxsize: 1000000,
	    			maxFiles: 5,
	    			colorize: true,
	    			tailable: true
	    		}),
	    		new winston.transports.File({
	    			name: 'sts.file.warn',
	    			level: 'warn',
	    			timestamp: true,
	    			label: name,
	    			filename: 'logs/warn.log',
	    			json: false,
	    			maxsize: 1000000,
	    			maxFiles: 5,
	    			colorize: true,
	    			tailable: true
	    		}),
	    		new winston.transports.File({
	    			name: 'sts.file.info',
	    			level: 'info',
	    			timestamp: true,
	    			label: name,
	    			filename: 'logs/info.log',
	    			json: false,
	    			maxsize: 1000000,
	    			maxFiles: 5,
	    			colorize: true
	    		}),
	    		new winston.transports.File({
	    			name: 'sts.file.debug',
	    			level: 'debug',
	    			timestamp: true,
	    			label: name,
	    			filename: 'logs/debug.log',
	    			json: false,
	    			maxsize: 2000000,
	    			maxFiles: 10,
	    			colorize: true,
	    			tailable: true
	    		})
	    	],
			exitOnError: false
		});
		loggers[name] = logger;
	}
	return loggers[name];
}

module.exports.getLogger = getLogger;

var networkLogger = new winston.Logger({
	transports: [
    		new winston.transports.File({
    			name: 'sts.file.network',
    			level: 'info',
    			timestamp: true,
    			label: "Network",
    			filename: 'logs/network.log',
    			json: false,
    			maxsize: 5000000,
    			maxFiles: 20,
    			tailable: true
    		})
    	],
		exitOnError: false
	});
module.exports.stream = {
	    write: function(message, encoding) {
	    	networkLogger.info(message);
	    }
	};
