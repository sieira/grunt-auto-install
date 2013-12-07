/*
 * grunt-auto-install
 * https://github.com/Manabu-GT/grunt-auto-install
 *
 * Copyright (c) 2013 Manabu-GT
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Libs
  var async = require('async');
  var exec = require('child_process').exec;

  grunt.registerTask('auto_install', 'Install and update npm & bower dependencies.', function() {

    var TASK_INFO = [
      {
        name: 'npm',
        cmd: 'npm install',
        package_meta_data: 'package.json'
      },
      {
        name: 'bower',
        cmd: 'bower install',
        package_meta_data: 'bower.json'
      }
    ];

    // Merge task-specific options with these defaults.
    var options = this.options({
      cwd: '',
      stdout: true,
      stderr: true,
      failOnError: true
    });

    var runCmd = function(item, callback) {
      grunt.log.writeln('running "' + item + '"...');
      var cmd = exec(item, function(error, stdout, stderr) {
        if(error) {
          callback(error);
          return;
        }
        grunt.log.writeln('done.');
        callback();
      });

      if(options.stdout || grunt.option('verbose')) {
        cmd.stdout.pipe(process.stdout);
      }
      if (options.stderr || grunt.option('verbose')) {
        cmd.stderr.pipe(process.stderr);
      }
    };

    var asyncTask = function(taskCmd) {
      return function(callback) {
        runCmd(taskCmd, callback);
      };
    };

    var installTasks = [];
    var done = this.async();

    for(var i = 0; i < TASK_INFO.length; i++) {
      var task = TASK_INFO[i];
      if(grunt.file.exists(options.cwd + task.package_meta_data)) {
        installTasks.push(asyncTask(task.cmd));
      }
    }

    async.series(installTasks,
      function(error, results) {
        if(error && options.failOnError) {
          grunt.warn(error);
        }
        done();
      }
    );

  });
};