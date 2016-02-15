angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("src/templates/autocomplete-list.html","<div>\n    <style>\n        .searchresultspopup-wrapper {\n            margin-top: -19px;\n            position: absolute;\n            z-index: 9999;\n            width: 100%\n        }\n        \n        .searchresultspopup {\n            border-radius: 0;\n            border: none;\n            -webkit-box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n            -moz-box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n            box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n            z-index: 1000;\n            float: left;\n            min-width: 100%;\n            padding: 5px 0;\n            margin: 2px 0 0;\n            font-size: 14px;\n            text-align: left;\n            list-style: none;\n            background-color: #fff;\n            -webkit-background-clip: padding-box;\n            background-clip: padding-box;\n            border: 1px solid #ccc;\n            border: 1px solid rgba(0, 0, 0, .15);\n        }\n        \n        .searchresultspopup span {\n            display: block;\n            padding: 3px 20px;\n            clear: both;\n            font-weight: normal;\n            line-height: 1.42857143;\n            color: #333;\n            white-space: nowrap;\n        }\n        \n        .searchresultspopup li.selected {\n            color: #262626;\n            text-decoration: none;\n            background-color: #f5f5f5;\n        }\n    </style>\n    <div class=\"searchresultspopup-wrapper\">\n        <ul ng-show=\'visible\' ng-if=\"results.length\" class=\'searchresultspopup\'>\n            <li ng-class=\"{ \'selected\' : isSelected($index) }\" ng-click=\'select($index,true)\' ng-repeat=\'result in results\'>\n                <span>{{result.display}}</span>\n            </li>\n        </ul>\n        <md-progress-linear ng-if=\"loading\" md-mode=\"indeterminate\"></md-progress-linear>\n    </div>\n</div>");
$templateCache.put("src/templates/autocomplete-material.html","<div>\n    <!-- Surrounding DIV for sfField builder to add a sfField directive to. -->\n    <div class=\"pull-left\" ng-controller=\"autocompleterCtrl\" ng-class=\"{\'has-error\': hasError(), \'has-success\': hasSuccess()}\">\n        <label>{{form.title}}</label>\n\n        <div style=\'position:relative\'>\n            <live-search \n            type=\"text\" \n            style=\"margin-bottom:0;\"\n            live-search-callback=\"form.options.asyncCallback\"\n            live-search-item-template=\"{{result.display}}\" \n            live-search-select=\"display\" \n            live-search-value=\"$$value$$\" \n            live-search-select-callback=\"onBlur\">\n            </live-search>\n        </div>\n         <div class=\"help-block\" ng-if=\"hasError()\" sf-message=\"(form.description || \'Required\')\"></div>\n        <!-- sf-field-model let\'s the ngModel builder know that you want a ng-model that matches against the form key here -->\n        <!-- schema-validate=\"form\" validates the form against the schema -->\n        <span schema-validate=\"form\" ng-model=\"$$value$$\"></span>\n        <!-- Description & Validation messages -->\n    </div>    \n</div>");}]);
angular.module("LiveSearch", ["ng"])
    .directive("liveSearch", ["$compile", "$timeout", "$templateCache", function ($compile, $timeout, $templateCache) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                liveSearchCallback: '=',
                liveSearchSelect: '=?',
                liveSearchSelectCallback: '=',
                liveSearchItemTemplate: '@',
                liveSearchWaitTimeout: '=?',
                liveSearchMaxResultSize: '=?',
                liveSearchMaxlength: '=?',
                liveSearchValue: '=',
            },
            template: "<input type='text' autocomplete='off'/>",
            link: function (scope, element, attrs, controller) {
                var timeout;
                scope.results = [];
                scope.visible = false;
                scope.selectedIndex = -1;


                scope.select = function (index,selectedFromList) {
                    scope.selectedFromList = selectedFromList;
                    scope.selectedIndex = index;
                    scope.visible = false;
                };

                scope.isSelected = function (index) {
                    return (scope.selectedIndex === index);
                };
                scope.results = [scope.liveSearchValue];
                scope.select(0)
                scope.$watch("selectedIndex", function (newValue, oldValue) {
                    var item = scope.results[newValue];
                    if (item) {
                        if (attrs.liveSearchSelectCallback) {
                            var value = scope.liveSearchSelectCallback.call(null, { items: scope.results, item: item });
                            element.val(value);
                        }
                        else {
                            if (attrs.liveSearchSelect) {
                                element.val(item[attrs.liveSearchSelect]);
                            }
                            else {
                                element.val(item);
                            }
                        }
                    }
                    if (item && 'undefined' !== element.controller('ngModel')) {
                        scope.liveSearchValue = item;
                    }
                });
                element[0].onblur = function () {
                    scope.abort = true;
                    scope.manualyAborted = true;
                    $timeout.cancel(timeout);
                    if(!scope.selectedFromList) {
                        scope.visible = false;
                        scope.loading = false;
                        var item = { value: element.val(), display: element.val() };
                        scope.results = [item];
                        scope.liveSearchSelectCallback.call(null, { items: scope.results, item: item })
                        scope.liveSearchValue = item;
                    }
                }
                element[0].onkeydown = function setSelected(e) {
                    if(e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                    }
                    //keydown
                    if (scope.visible) {
                        if (e.keyCode == 40) {
                            if (scope.selectedIndex + 1 === scope.results.length) {
                                scope.selectedIndex = 0;
                            }
                            else {
                                scope.selectedIndex++;
                            }
                        } 
                        //keyup
                        else if (e.keyCode == 38) {
                            if (scope.selectedIndex === 0) {
                                scope.selectedIndex = scope.results.length - 1;
                            }
                            else if (scope.selectedIndex == -1) {
                                scope.selectedIndex = 0;
                            }
                            else scope.selectedIndex--;
                        }
                        //keydown or keyup
                        if (e.keyCode == 13) {
                            scope.visible = false;
                            scope.selectedFromList = true;
                        }

                        //unmanaged code needs to force apply
                        scope.$apply();
                    }
                };

                var startSearch = function startSearch(e) {
                    
                    if (e.keyCode == 13)
                        element[0].onblur();
                    if (e.keyCode == 13 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
                        return false;
                    }
                    var target = angular.element(e.target);
                    // Set Timeout
                    $timeout.cancel(timeout);
                    // Set Search String
                    var vals = target.val().split(",");
                    var search_string = vals[vals.length - 1].trim();
                    // Do Search
                    
                    if (search_string.length < 1 ||
                        (scope.liveSearchMaxlength !== null && search_string.length > scope.liveSearchMaxlength)) {
                        scope.visible = false;
                        
                        //unmanaged code needs to force apply
                        scope.$apply();
                        return;
                    }
                    timeout = $timeout(function () {
                        var results = [];
                        var promise = scope.liveSearchCallback.call(null, scope.$parent.form, search_string);
                        scope.loading = true;
                        scope.abort = false;
                        scope.visible = false;
                        scope.manualyAborted = false;     
                        promise.then(function (dataArray) {
                            scope.abort = false; 
                            if (dataArray) {
                                results = dataArray.slice(0, (scope.liveSearchMaxResultSize || 20) - 1);
                            }
                            return;
                        });
                        promise.catch(function() {
                           scope.abort = true; 
                        });
                        promise.finally(function () {
                            if (!scope.abort && !scope.manualyAborted) {
                                scope.visible = true;
                                scope.loading = false;
                                scope.selectedIndex = -1;
                                scope.results = results.filter(function (elem, pos) {
                                    return results.indexOf(elem) == pos;
                                });
                                return;
                            }
                        });
                    }, scope.liveSearchWaitTimeout || 100);
                };
                element[0].onkeyup = startSearch
                scope.clear = function () {
                    element.val(null);
                    element[0].onblur();
                }
                var template = $templateCache.get("src/templates/autocomplete-list.html");
                var searchPopup = $compile(template)(scope);
                angular.element(element.parent())[0].appendChild(searchPopup[0]);
            }
        };
    }]);
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
            $scope.$parent.form.onSelect();
        return newValue.item.display;
    }
});
