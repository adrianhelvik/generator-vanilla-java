( function () {

    `use strict`;

    var gulp = require( `gulp` );
    var child_process = require( `child_process` );
    var process = require( `process` );
    var exec = child_process.exec;
    var execSync = child_process.execSync;
    var spawn = child_process.spawn;
    require( `colors` );

    var conf = require( './config' );

    gulp.task( `default`, [
        `build-java`,
        `build-spec`,
        `watch-spec`,
        `run-spec`,
        `watch-java`,
        `run-java`,
    ] );

    gulp.task( `watch-java`, () => {
        console.log( `--- watching java ---`.green );
        gulp.watch( `${conf.src}/**/*.java`, [ `build-java`, `run-java` ] );
    } );

    gulp.task( `watch-spec`, () => {
        console.log( `--- watching spec ---`.yellow );
        gulp.watch( `${conf.spec}/*.java`, [ `build-spec`, `run-spec` ] );
        gulp.watch( `${conf.src}/**/*.java`, [ `build-spec`, `run-spec` ] );
    } );

    var buildTimeoutId = null;

    gulp.task( `build-java`, () => {
        console.log( `--- building java ---`.cyan );
        if ( buildTimeoutId !== null ) {
            clearTimeout( buildTimeoutId );
        }

        execSync( `rm -rf ${conf.dest}` );
        execSync( `mkdir -p ${conf.dest}` );

        var compile = execSync( `javac ${conf.mainClass}.java -d ../${conf.dest}`, {
            cwd: __dirname + `/${conf.src}`,
            stdio: [ 1, 2, 3 ]
        } );

    } );

    gulp.task( `build-spec`, () => {
        console.log( `--- building tests ---`.yellow );

        execSync( `rm -rf __TEMP` );

        execSync( `rm -rf ${conf.specDest}` );
        execSync( `mkdir -p ${conf.specDest}` );
        execSync( `mkdir __TEMP` );
        execSync( `cp -r ${conf.src}/* __TEMP` );
        execSync( `cp -r ${conf.spec}/* __TEMP` );
        execSync( `cp -r ${conf.spec}/com __TEMP` );
        execSync( `cp -r ${conf.spec}/com ${conf.specDest}` );

        var buildSpec = execSync( `javac *.java -d ../${conf.specDest}`, {
            cwd: __dirname + `/__TEMP`,
            stdio: [ 0, 1, 2 ]
        } );

        execSync( `rm -rf __TEMP` );

    } );

    gulp.task( `run-spec`, () => {
        console.log( `--- running tests ---`.yellow );

        var tests = fs.readdirSync( __dirname + `/${conf.specDest}` )
            .filter( filename => /Spec\.class$/.test( filename ) )
            .map( filename => filename.replace( /\.class$/, `` ) );

        tests.forEach( function ( spec ) {
            console.log( `-------------------------------------`.black );
            console.log( `--- current spec: ${spec} ---`.yellow );
            console.log( `-------------------------------------`.black );
            execSync( `java ${conf.spec}`, {
                cwd: __dirname + `/${conf.specDest}`,
                stdio: [ 0, 1, 2 ]
            } );
        } );

        console.log( `-------------------------------------`.black );

    } );

    var isRunning = false;
    var program;

    gulp.task( `run-java`, () => {
        if ( isRunning ) {
            program.kill( `SIGKILL` );
        }

        console.log( `--- running program ---`.green );

        isRunning = true;
        program = exec( `java ${conf.mainClass}`, {
            cwd: __dirname + `/${conf.dest}`
        }, function ( error, stdio, stderr ) {
            if ( stdio )
                process.stdout.write( stdio );
            if ( stderr )
                process.stderr.write( stderr.red );
            if ( error ) {
                if ( error.signal === `SIGKILL` )
                    console.log( `--- killed running program ---`.green, error );
                else
                    console.log( `NODE ERROR in run-java`.red, error );
            }
        } );

        program.on( `close`, code => {
            console.log( `--- program terminated ---`.green );
            isRunning = false;
        } );

    } );

    gulp.task( `clean`, () => {
        execSync( `rm -rf ${conf.dest}` );
    } );

} )();
