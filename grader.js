#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(html, checksfile) {
    $ = cheerio.load(html);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkAndPrint = function(html, checksfile) {
    var checkJson = checkHtml(html, checksfile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
};

if(require.main == module) {
    program
        .option('-c, --checks <file>', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file <file>', 'Path to index.html', assertFileExists)
        .option('-u, --url <URL>', 'URL for web page')
        .parse(process.argv);
    if (program.file) {
	checkAndPrint(fs.readFileSync(program.file), program.checks);
    } else if (program.url) {
	rest.get(program.url).on('complete', function(result) {
	    checkAndPrint(result, program.checks);
	});
    } else {
	checkAndPrint(fs.readFileSync(HTMLFILE_DEFAULT), program.checks);
    }
}