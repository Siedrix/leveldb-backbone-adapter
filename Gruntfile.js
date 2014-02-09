module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			scripts: {
				files: ['test/*.js', 'lib/*.js'],
				tasks: ['mochaTest'],
				options: {
					spawn: true,
				}
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['test/*.js']
			}
		},
		plato: {
			your_task: {
				files: {
					'reports/': ['lib/*.js', 'test/*.js']
				}
			}
		},
		githooks: {
			all: {}
		}
	});

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-githooks');
	grunt.loadNpmTasks('grunt-plato');

	grunt.registerTask('default');
};