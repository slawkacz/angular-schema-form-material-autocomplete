angular.module('autocompleteMaterial', [
    'schemaForm',
    'LiveSearch',
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
            $scope.$$childHead.clear();
        }
    });
    $scope.onBlur = function (newValue) {
        $scope.$$childHead.ngModel = newValue.item;
        if ($scope.$parent.form.onSelect)
            $scope.$parent.form.onSelect($scope);
        return newValue.item.display;
    }
});
