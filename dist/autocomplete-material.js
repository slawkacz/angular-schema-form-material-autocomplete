angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/autocomplete-material.html","<div>\n    <!-- Surrounding DIV for sfField builder to add a sfField directive to. -->\n    <div class=\"pull-left\" ng-controller=\"autocompleterCtrl\">\n        <label>{{form.title}}</label>\n        <md-autocomplete ng-model=\"$$value$$\" sf-changed=\"form\" md-selected-item=\"$$value$$\" md-selected-item-change=\"form.onSelect(this)\"\n        schema-validate=\"form\" md-search-text=\"searchText\" placeholder=\"{{form.schema.placeholder}}\" ng-blur=\"form.onBlur(this, searchText)\"\n        ng-keydown=\"form.onBlur(this, searchText)\" md-search-text-change=\"form.onSearchChange(form,searchText)\"\n        md-items=\"item in form.options.asyncCallback(form, searchText)\" md-item-text=\"item.display\">\n            <span md-highlight-text=\"searchText\">{{item.display}}</span>\n        </md-autocomplete>\n        <!-- sf-field-model let\'s the ngModel builder know that you want a ng-model that matches against the form key here -->\n        <!-- schema-validate=\"form\" validates the form against the schema -->\n\n        <!-- Description & Validation messages -->\n    </div>\n</div>");}]);
angular.module('autocompleteMaterial', [
    'schemaForm',
    'templates'
]).config(function (schemaFormDecoratorsProvider, sfBuilderProvider) {
    schemaFormDecoratorsProvider.defineAddOn(
        'bootstrapDecorator',           // Name of the decorator you want to add to.
        'autocomplete-material',                      // Form type that should render this add-on
        'src/templates/autocomplete-material.html',  // Template name in $templateCache
        sfBuilderProvider.stdBuilders   // List of builder functions to apply.
        );

}).controller('autocompleterCtrl', function ($scope) {
    $scope.$on('refreshAutocompleter', function (e, key) {
        if (_.isEqual($scope.$parent.form.key, key)) {
            $scope.$$childHead.$mdAutocompleteCtrl.clear();  
        }
    })
});
