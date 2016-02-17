var generators = require( 'yeoman-generator' );
var mkdirp = require( 'mkdirp' );
var fs = require( 'fs' );
require( 'colors' );

module.exports = generators.Base.extend( {

    init() {
        this.log( 'Generating vanilla java project' );
    },

    fetchProjectName() {
        var done = this.async();

        this.prompt( {
            type: 'input',
            name: 'name',
            message: 'Your project name',
            default: this.appname.replace( /\s/g, '-' ),
            store: true
        }, ( answers ) => {
            this.appname = answers.name;
            done();
        } );
    },

    generateFolders() {
        mkdirp( 'src' );
        mkdirp( 'dest' );
        mkdirp( 'spec' );
        mkdirp( 'spec-dest' );
        mkdirp( 'lib' );
    },

    createPackageJson() {
        this.fs.copyTpl(
            this.templatePath( 'package.json' ),
            this.destinationPath( 'package.json' ),
            { appname: this.appname }
        );
    },

    createGulpfile() {
        this.fs.copyTpl(
            this.templatePath( 'gulpfile.js' ),
            this.destinationPath( 'gulpfile.js' )
        );

        this.fs.copyTpl(
            this.templatePath( 'config.js' ),
            this.destinationPath( 'config.js' )
        );
    },

} );
