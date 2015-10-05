'use strict';
var Promise    = require( 'bluebird' );
var handlebars = require( 'handlebars' );
var glob       = Promise.promisify( require( 'glob' ) );
var _          = require( 'lodash' );
var fs         = require( 'fs' );

SpecGenerator.prototype.generateName = function ( path, type ) {

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
		return _.camelCase(
			[
				path[ start ],
				'-',
				path[ end ],
				'-',
				( path[ path.length - 1 ].split( '.' )[ 0 ] ),
			 	'Partial'
			].join('')
		);
	}
		return path.substring( path.lastIndexOf('/') + 1, path.length - 3 );
}

SpecGenerator.prototype.getJSONFiles = function ( path ) {
	return glob( path + '/**/*.json' )
		.then( function ( files ) {
			return files;
		} );
}

SpecGenerator.prototype.getTemplate = function ( templates, scenario ) {
	return _.find( templates, function ( element ) {
		if( generateName( element, 'template' ) === scenario ) {
			return element;
		}
	} );
}

SpecGenerator.prototype.getTemplates = function ( path ) {
	var options =  { ignore : path + '/**/partials/**/*.js' };
	  return glob( path + '/**/*.js', options )
		.then( function ( files, err ) {
			return files;
		} );
}

SpecGenerator.prototype.registerPartials = function () {
	return glob( path + '/**/partials/**/*.js' )
		.then ( function ( files, err ) {
			_.forEach( files, function ( element ) {
				handlebars.registerPartial( generateName( element.split( '/' ), 'partial' ), fs.readFileSync( element, 'utf8' ) );
			} );
			return;
		} );
}

function SpecGenerator ( options ) {
	var jsonFiles  = [];
	var templates  = [];
	var spec;
	var jsonData;

	var self = this;

	this.getJSONFiles( options.ddJsonFiles )
		.then( function ( jsonFiles ) {
			jsonFiles = jsonFiles;
			return self.getTemplates ( options.ddTemplates );
		} )
		.then( function ( templates ) {
			templates = files;
			registerPartials ( options.ddTemplates )
		} )
		.then( function () {
			require( './node_modules/handlebars-helpers/lib/helper-lib.js' ).register( handlebars, {} );

			_.forEach( jsonFiles, function ( element, index ) {

				jsonData = require( process.cwd() + element.substr( 1, element.length ) );
				spec = handlebars.compile( fs.readFileSync( this.getTemplate ( templates, jsonData.scenario ), 'utf8' ) );

				var parentPath = [
									options.ddGeneratedSpecs,
									'/',
									jsonData.scenario,
									'/'
								].join('');

				var childPath = [
									path,
									jsonData.scenarioType,
									'/'
									].join( '' );
				var generatedSpecName = [
											jsonData.scenario,
											jsonData.scenarioId,
											'.spec.js'
										].join( '' );

				fs.mkdirSync( parentPath );
				fs.mkdirSync( childPath );
				fs.writeFileSync( childPath + generatedSpecName, spec( jsonData ) );
			} );
		} )
		.catch( function ( err ) {
			console.log( err );
		} );
}

module.exports = SpecGenerator;
