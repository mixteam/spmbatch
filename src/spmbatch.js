var VERSION = '0.2.2',
	path = require('path'),
	util = require('util'),
	fs = require('fs'),
	exec = require('child_process').exec

	options = {
		basedir : './',
		log : true,
		process : 'spm',
		cmd : undefined
	}
	;

function isModule(dir) {
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

function runCommand(dir, prs, cmd) {
	var spmFile = path.join(dir, '.spm')
		;

	exec(prs + ' ' + cmd, {
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
		if (isModule(dir)) {
			runCommand(dir, options.process, options.cmd);
		}
		
		fs.readdir(dir, function(err, files) {
			files.forEach(function(file) {
				if (file in ['.', '..', '.git', '.svn']) return;

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


function main(args) {
	if (args && args instanceof Array){
		while (args.length > 0) {
			var v = args.shift();

			switch(v) {
				case '-d':
				case '--dir':
					options.basedir = args.shift();
					break;
				case '-p':
				case '--process':
					options.process = args.shift();
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
	} else if (args && typeof args === 'object') {
		for (var k in args) {
			options[k] = args[k];
		}
	}

	if (!options.cmd) {
		util.error('no command for batch');
	} else {
		batch(options.basedir);
	}
}

if (require.main === module) {
	main(process.argv.slice(2));
} else {
	module.exports = main;
}
