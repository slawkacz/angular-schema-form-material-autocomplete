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
