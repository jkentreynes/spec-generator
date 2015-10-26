var SpecGenerator = require( './index.js' );

( function () {
	var spec = new SpecGenerator( {
            "ddJsonFiles"      : "./test/dd-e2e/json-files",
            "ddTemplates"      : "./test/dd-e2e/spec-templates",
            "ddGeneratedSpecs" : "./test/dd-e2e/generated-specs"
          } ).then( function () {
          	console.log( 'done' );
          } );
} )();