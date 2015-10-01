'use strict';
var Promise    = require( 'bluebird' );
var handlebars = require( 'handlebars' );
var glob       = Promise.promisify( require( 'glob' ) );
var _          = require( 'lodash' );
var fs         = require( 'fs' );
var jsonFiles  = [];
var templates  = [];
var config;

function generateName ( path, type ) {

	if ( type === 'partial' ) {
		var start =  _.findIndex( path, function ( element, index ) {
			if ( element === 'spec-templates') {
				return index;
			}
		} ) + 1;
		var end = _.findIndex( path, function ( element, index ) {
			if ( element === 'partials' ) {
				return index;
			}
		} ) - 1;
		return _.camelCase( path[ start ] + '-' +path[ end ] + '-' + ( path[ path.length - 1 ].split( '.' )[ 0 ] ) + 'Partial' ) ;
	}

	else {
		return path.substring( path.lastIndexOf('/') + 1, path.length - 3 );
	}

}

function getJSONFiles () {
	return glob( config.ddJsonFiles + '/**/*.json' )
		.then( function ( files ) {
			jsonFiles = files;
			return;
		} );
}

function getTemplate ( scenario ) {
	return _.find( templates, function ( element ) {
		if( generateName( element, 'template' ) === scenario ) {
			return element;
		}
	} );
}

function getTemplates() {
	  return glob( config.ddTemplates + '**/*.js', { ignore : config.ddTemplates + '**/partials/**/*.js' } )
		.then( function ( files, err ) {
			templates = files;
			return;
		} );
}

function registerPartials () {
	return glob( config.ddTemplates + '**/partials/**/*.js' )
		.then ( function ( files, err ) {
			_.forEach( files, function ( element ) {
				handlebars.registerPartial( generateName( element.split( '/' ), 'partial' ), fs.readFileSync( element, 'utf8' ) );
			} );
			return;
		} );
}

function initialize () {
	return getJSONFiles()
		.then( getTemplates )
		.then( registerPartials );
}

module.exports = ( function ( options ) {
	var spec;
	var jsonData;

	config = require( options );

	initialize()
		.then( function () {
			require( './node_modules/handlebars-helpers/lib/helper-lib.js' ).register( handlebars, {} );

			_.forEach( jsonFiles, function ( element, index ) {
				jsonData = require( element );

				spec = handlebars.compile( fs.readFileSync( getTemplate ( jsonData.scenario ), 'utf8' ) );

				try {
					fs.mkdirSync( config.ddGeneratedSpecs + jsonData.scenario );
					fs.mkdirSync( config.ddGeneratedSpecs + jsonData.scenario + '/' + jsonData.scenarioType );
				}
				catch( err ){
					console.log( err );
				}

				fs.writeFileSync( config.ddGeneratedSpecs + jsonData.scenario + '/' + jsonData.scenarioType + '/' + jsonData.scenario + jsonData.scenarioId + '.spec.js', spec( jsonData ) );
			} );
		} );
} ) ();
