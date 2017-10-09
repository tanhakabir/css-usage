module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
        src: {
            src: [
			        'lib/*.js'
            ],
            dest: 'cssUsage.js'
        }
    },
    strip_code: {
      options: {
        patterns: [
          /currentRowTemplate.push\(\'(css|dom|html)\'\);/g,
          /convertToTSV\(INSTRUMENTATION_RESULTS\[\'(css|dom|html)\'\]\);[\n\r]+\s+currentRowTemplate.pop\(\);/g
        ]
      },
      your_target: {
        files: [
          {src: 'cssUsage.src.js', dest: 'Recipe.min.js'}
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-strip-code');
  grunt.registerTask('default', ['concat', 'strip_code']);
};