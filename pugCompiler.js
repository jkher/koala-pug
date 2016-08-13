/*
 * Pug compiler extension for Koala
 * 
 * Copyright 2016 Jaydeep Kher
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs'),
    path = require('path'),
    FileManager = global.getFileManager(),
    Compiler = require(FileManager.appScriptDir + '/Compiler');

function PugCompiler(config) {
    compiler.call(this, config);
}
require('util').inherits(PugCompiler, Compiler);
module.exports = PugCompiler;

/**
 * compile file
 * @param  {Object} file    compile file object
 * @param  {Object} emitter  compile event emitter
 */
PugCompiler.prototype.compile = function(file, emitter) {
	var pug = require('pug'),
		self = this,
		filePath = file.src,
		output = file.output,
		settings = file.settings || {};

	var triggerError = function (message) {
		emitter.emit('fail');
		emitter.emit('always');
		self.throwError(message, filePath);
	};

	fs.readFile(filePath, 'utf8', function (rErr, code) {
        if (rErr) {
        	triggerError(rErr.message);
			return false;
        }

		var html;
		try {
        	var options = {};
        	if(settings.prettyHtml) {
        		options.pretty = settings.prettyHtml;
        	}
			options.basedir = path.dirname(file.src);
			options.filename = filePath;
			html = pug.render(code, options);
    	} catch (e) {
			triggerError(e.message);
			return false;
		}

		fs.writeFile(output, html, 'utf8', function (wErr) {
			if (wErr) {
				triggerError(wErr.message);
			} else {
				emitter.emit('done');
				emitter.emit('always');
			}
		});
	});
}