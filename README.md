#Data Driven End-to-End Testing
This section is about data driven end to end testing.

#Technologies Used
- handlebars for templating engine
- protractor for end to end testing

#Folder Structure
Under the dd-e2e folder exists the following folder structure:
- generated-specs (All the dynamically generated protractor spec templates is placed in here)
- json-files (All the json files (dynamic and static) to be used in the data driven testing are placed in here)
- spec-templates (All the handlebars spec templates are placed in here)
- validate-results (All the validation results are placed in here)

###generated-specs folder
The contents of this folder are automatically created by the spec generator. Sub-folders consists of scenario -> scenario-type ->  template.hbs which is a combination of the meta-data of the json provided.

###json-files folder
The contents of this folder are the json files that are to be fed to the spec generator and the json files that are created by the scraper which will then be fed to the validator for validation purposes.

###spec-templates
The contents of this folder are the handblebars templates that will be used by the spec generator in order to dynamically generate a protactor spec file.

###validate-results
The contents of this folder are the validation results in html file. If folder is empty, all validation did not return false.

#Usage
###Install dependencies.
The following dependencies are in a private repository and cannot be installed using npm install. To install these dependencies first, go to this repository's node_modules folder and enter these commands in the terminal:
```
git clone git@github.com:School-Improvement-Network/qa-dd-spec-generator.git
git clone git@github.com:School-Improvement-Network/qa-dd-json-validator.git

```
After running the commands, open their respective folders and enter the following command:
```
npm install
```

###Prepare json files
JSON files that are to be used must be present and placed under the json-files folder
JSON files must have these following meta-data:
- scenarioId
- scenario
- scenarioType

###Run Gulp Task
```
gulp dd-e2e
```

See validate-results folder for validation results.


