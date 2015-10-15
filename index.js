'use strict';

var _          = require( 'lodash' );
var Promise    = require( 'bluebird' );
var handlebars = require( 'handlebars' );
var glob       = Promise.promisify( require( 'glob' ) );
var path       = require( 'path' );
var fs         = require( 'fs-extra' );

// Require handlebars helpers
require( './node_modules/handlebars-helpers/lib/helper-lib.js' ).register( handlebars, {} );

const partialsPath = '/partials/**/*.hbs';

function globber ( pattern, options, fileKind ) {
	options = options || {};

	return glob( pattern, options ).then( function ( files ) {
		if ( files.length === 0 ) {
			throw new Error( fileKind + ' files not found: ' + pattern );
		}
		return files;
	} );
}

function generateName ( filePath ) {
	return path.basename( filePath, path.extname( filePath ) );
}

function getTemplate ( templates, scenario ) {
	return _.find( templates, function ( element ) {
		return generateName( element, 'template' ) === scenario;
	} );
}

function getTemplates ( path ) {
	const options =  { 'ignore' : path + '/**/partials/**/*.hbs' };

	return globber( path + '/**/*.hbs', options, 'templates' );
}

function registerPartials ( path ) {
	function generatePartialName ( partialPath ) {
		var index = _.findIndex( partialPath, function ( element ) {
			return element === 'spec-templates';
		} ) + 1;

		partialPath = _.slice( partialPath, index, partialPath.length);

		_.remove( partialPath, function ( value ) {
			return value === 'partials'
		} );

		partialPath[ partialPath.length - 1 ] = partialPath[ partialPath.length - 1 ].split( '.' )[ 0 ];

		partialPath.push( 'Partial' );

		return _.camelCase( partialPath );
	}

	return globber( path + '/**/partials/**/*.hbs', 'partials' )
		.then ( function ( files, err ) {
			if( err ) {
				throw( err );
			}
			_.forEach( files, function ( element ) {
				handlebars.registerPartial( generatePartialName( element.split( '/' ), 'partial' ), fs.readFileSync( element, 'utf8' ) );
			} );
			return;
		} );
}

function SpecGenerator ( options ) {

	return new Promise( function ( resolve, reject ) {
		Promise.all( [
			getTemplates ( options.ddTemplates ),
			registerPartials ( options.ddTemplates )
		] ).spread( function ( templates ) {

					const template = getTemplate ( templates, options.jsonData.scenario );

					const compiled = handlebars.compile( fs.readFileSync( template, 'utf8' ) );

					const spec = compiled( options.jsonData );


					var generatedSpecPath = [
										options.ddGeneratedSpecs,
										'/',
										options.jsonData.scenario,
										'/',
										options.jsonData.scenarioType,
										'/'
									].join('');

					var generatedSpecName = [
												options.jsonData.scenarioId,
												options.jsonData.scenario,
												'.spec.js'
											].join( '' );

					const generatedSpec = generatedSpecPath + generatedSpecName;

					fs.outputFileSync( generatedSpec, spec);

					resolve( generatedSpec );
		} )
		.catch( function ( err ) {
			reject( err );
		} );
	} );
}

module.exports = SpecGenerator;
