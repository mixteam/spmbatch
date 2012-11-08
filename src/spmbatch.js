#!/usr/bin/env node
// -*- js -*-

var VERSION = '0.2.0',
	path = require('path'),
	util = require('util'),
	fs = require('fs'),
	exec = require('child_process').exec

	options = {
		basedir : './',
		log : true,
		cmd : undefined
	}
	;

function isSpmModule(dir) {
	var packageFile = path.join(dir, 'package.json')
		;

	return fs.existsSync(packageFile);
}

function isIgnore(dir) {
	var spmFile = path.join(dir, '.spm'),
		spmText
		;

	if (fs.existsSync(spmFile)) {
		spmText = fs.readFileSync(spmFile, 'utf8');
		return (spmText === 'ignore');
	} else {
		return false;
	}
}

function runCommand(dir, cmd) {
	var spmFile = path.join(dir, '.spm')
		;

	exec('spm ' + cmd + ' -compiler=closure', {
		cwd : dir,
		encoding : 'utf8'
	}, function(err, stdout, stderr) {
		if (err)  {
			util.error(cmd + ' "' + dir + '" error');
		} else {
			if (options.log) {
				fs.writeFileSync(spmFile, stdout || stderr, 'utf8');
			}
			util.debug(cmd + ' "' + dir + '" success');
		}
	});
}

function batch(dir) {
	if (!isIgnore(dir)) {
		if (isSpmModule(dir)) {
			runCommand(dir, options.cmd);
		}
		
		fs.readdir(dir, function(err, files) {
			files.forEach(function(file) {
				if (file in ['.', '..', '.git']) return;

				var subdir = path.join(dir, file),
					stat = fs.statSync(subdir)
					;

				if (stat.isDirectory()) {
					batch(subdir);
				}
			});
		});
	}
}


function main(argv) {
	
	var args = argv.slice(2)
		;

	while (args.length > 0) {
		var v = args.shift();

		switch(v) {
			case '-d':
			case '--dir':
				options.basedir = args.shift();
				break;
			case '--nolog':
				options.log = false;
				break;
			case '-v':
			case '--version':
				util.print('version ' + VERSION+"\n");
				process.exit(0);
				break;
			default:
				options.cmd = v;
				break;
		}
	}

	if (!options.cmd) {
		util.error('no command for batch');
	} else {
		batch(options.basedir);
	}
}

if (require.main === module) {
	main(process.argv);
} else {
	module.exports = main;
}
