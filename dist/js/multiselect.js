/*
 * @license
 *
 * Multiselect v2.5.5
 * http://crlcu.github.io/multiselect/
 *
 * Copyright (c) 2016-2018 Adrian Crisan
 * Licensed under the MIT license (https://github.com/crlcu/multiselect/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') {
    throw new Error('multiselect requires jQuery');
}

;(function ($) {
    'use strict';

    var version = $.fn.jquery.split(' ')[0].split('.');

    if (version[0] < 2 && version[1] < 7) {
        throw new Error('multiselect requires jQuery version 1.7 or higher');
    }
})(jQuery);

;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery.
        define(['jquery'], factory);
    } else {
        // No AMD. Register plugin with global jQuery object.
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var searchIcon = '<svg class="svgic svgic-search" role="img" aria-hidden="true" version="1.1" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M15.504 13.616l-3.79-3.223c-0.392-0.353-0.811-0.514-1.149-0.499 0.895-1.048 1.435-2.407 1.435-3.893 0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.486 0 2.845-0.54 3.893-1.435-0.016 0.338 0.146 0.757 0.499 1.149l3.223 3.79c0.552 0.613 1.453 0.665 2.003 0.115s0.498-1.452-0.115-2.003zM6 10c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"></path></svg>',
        searchHtml = '<div class="input-group m-b-xs"><span class="input-group-addon">' + searchIcon + '</span><input type="text" class="form-control"></div>',
        doubleRightIconHtml = '<svg width="16" height="16" class="svgic svgic-si-glyph-triangle-double-arrow-right" role="img" aria-hidden="true" viewBox="0 0 16 16" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill="currentColor"><path d="M9.113,15.495 C8.531,16.076 7.01,16.395 7.01,14.494 L7.01,1.506 C7.01,-0.333 8.531,-0.076 9.113,0.506 L15.557,6.948 C16.137,7.529 16.137,8.47 15.557,9.052 L9.113,15.495 L9.113,15.495 Z"></path><path d="M2.113,15.495 C1.531,16.076 0.01,16.395 0.01,14.494 L0.01,1.506 C0.01,-0.333 1.531,-0.076 2.113,0.506 L8.557,6.948 C9.137,7.529 9.137,8.47 8.557,9.052 L2.113,15.495 L2.113,15.495 Z"></path></g></g></svg>',
        rightIconHtml = '<svg width="17" height="16" class="svgic svgic-si-glyph-triangle-right" role="img" aria-hidden="true" viewBox="0 0 17 16" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M6.113,15.495 C5.531,16.076 4.01,16.395 4.01,14.494 L4.01,1.506 C4.01,-0.333 5.531,-0.076 6.113,0.506 L12.557,6.948 C13.137,7.529 13.137,8.47 12.557,9.052 L6.113,15.495 L6.113,15.495 Z" fill="currentColor"></path></g></svg>',
        leftIconHtml = '<svg width="17" height="17" class="svgic svgic-si-glyph-triangle-left" role="img" aria-hidden="true" viewBox="0 0 17 17" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M3.446,10.052 C2.866,9.471 2.866,8.53 3.446,7.948 L9.89,1.506 C10.471,0.924 11.993,0.667 11.993,2.506 L11.993,15.494 C11.993,17.395 10.472,17.076 9.89,16.495 L3.446,10.052 L3.446,10.052 Z" fill="currentColor"></path></g></svg>',
        doubleLeftIconHtml = '<svg width="17" height="17" class="svgic svgic-si-glyph-triangle-double-arrow-left" role="img" aria-hidden="true" viewBox="0 0 17 17" version="1.1"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(1.000000, 1.000000)" fill="currentColor"><path d="M0.446,9.052 C-0.134,8.471 -0.134,7.53 0.446,6.948 L6.89,0.506 C7.471,-0.076 8.993,-0.333 8.993,1.506 L8.993,14.494 C8.993,16.395 7.472,16.076 6.89,15.495 L0.446,9.052 L0.446,9.052 Z"></path><path d="M7.446,9.052 C6.866,8.471 6.866,7.53 7.446,6.948 L13.89,0.506 C14.471,-0.076 15.993,-0.333 15.993,1.506 L15.993,14.494 C15.993,16.395 14.472,16.076 13.89,15.495 L7.446,9.052 L7.446,9.052 Z"></path></g></g></svg>',
        rowHtml = '<div class="MultiSelect-Row">',
        leftColHtml = '<div class="MultiSelect-Col MultiSelect-Col--left">',
        middleColHtml = '<div class="MultiSelect-Col MultiSelect-Col--middle">',
        rightColHtml = '<div class="MultiSelect-Col MultiSelect-Col--right">',
        closingDivHtml = '</div>',
        createLabel = function (label, forId) {
            return '<label for="' + forId + '" class="small text-muted fw-n m-b-0">' + label + '</label>';
        },
        createButton = function (title, iconHtml, isAdd) {
            return $('<button type="button" class="btn btn-block btn-outline-' + (isAdd ? 'success' : 'danger') + ' btn-svgic" title="' + title + '">' + iconHtml + '</button>');
        },
        getOptions = function ($options, useSelected, allIsActuallySelected) {
            return $(
                (allIsActuallySelected === true ? $options : $options.filter(useSelected ? ':selected' : ':not(:selected)'))
                    .map(function () {
                        var $me = $(this);

                        return '<option value="' + $me.attr('value')  + '">' + $me.text() + '</option>'
                    })
                    .get()
                    .join('')
            );
        };

    var Multiselect = (function($) {
        /** Multiselect object constructor
         *
         *  @class Multiselect
         *  @constructor
        **/
        function Multiselect( $select, settings ) {
            var id = $select.prop('id'),
                labelHtml = $('label[for="' + id + '"]').html(),
                $emptySelect = $select
                    .clone()
                    .empty()
                    .attr('size', $select.prop('size') || 8)
                    .removeAttr('name')
                    .removeAttr('required')
                    .removeAttr('data-role'),
                $allOptions = $select.children(),
                $options = $allOptions.slice(1),
                allActuallySelected = $allOptions.first().is(':selected'),
                $leftSelect = $emptySelect.clone().attr('id', id + '_from'),
                $rightSelect = $emptySelect.clone().attr('id', id + '_to'),
                $panel = $(
                    '<div class="panel panel-default MultiSelect">' +
                        '<div class="panel-heading fw-b">' + labelHtml + closingDivHtml +
                        '<div class="panel-body">' +
                            rowHtml +
                                leftColHtml + closingDivHtml +
                                middleColHtml + closingDivHtml +
                                rightColHtml + closingDivHtml +
                            closingDivHtml +
                            rowHtml +
                                leftColHtml + closingDivHtml +
                                middleColHtml +
                                    '<div class="MultiSelect-BtnContainer">' + closingDivHtml +
                                closingDivHtml +
                                rightColHtml + closingDivHtml +
                            closingDivHtml +
                            rowHtml +
                                leftColHtml +
                                    createLabel('Seçilebilir öğeler', $leftSelect.prop('id')) +
                                closingDivHtml +
                                middleColHtml + closingDivHtml +
                                rightColHtml +
                                    createLabel('Seçili öğeler', $rightSelect.prop('id')) +
                                closingDivHtml +
                            closingDivHtml +
                        closingDivHtml +
                    closingDivHtml
                ),
                $rightAll = createButton('Tümünü ekle', doubleRightIconHtml, true),
                $rightSelected = createButton('Seçili öğeleri ekle', rightIconHtml, true),
                $leftSelected = createButton('Seçili öğeleri çıkar', leftIconHtml, false),
                $leftAll = createButton('Tümünü çıkar', doubleLeftIconHtml, false),
                $selectContainers = $panel
                    .find('.MultiSelect-Row')
                    .next()
                    .children('.MultiSelect-Col--left, .MultiSelect-Col--right');

            $panel.find('.MultiSelect-BtnContainer').append($rightAll, $rightSelected, $leftSelected, $leftAll);
            $leftSelect.appendTo($selectContainers[0]);
            $rightSelect.appendTo($selectContainers[1]);
            getOptions($options, false).appendTo($leftSelect);
            getOptions($options, true, allActuallySelected).appendTo($rightSelect);
            $panel.insertBefore($select.closest('.form-group'));

            this.numAll = $options.length;
            this.numSelected = allActuallySelected ? $options.length : $rightSelect.children().length;
            this.$select = $select;
            this.$allOptions = $allOptions;
            this.$left = $leftSelect;
            this.$right = $rightSelect;
            this.actions = {
                $leftAll:       $leftAll,
                $rightAll:      $rightAll,
                $leftSelected:  $leftSelected,
                $rightSelected: $rightSelected,

                $undo:          $( settings.undo ).length ? $( settings.undo ) : $('#' + id + '_undo'),
                $redo:          $( settings.redo ).length ? $( settings.redo ) : $('#' + id + '_redo'),

                $moveUp:        $( settings.moveUp ).length ? $( settings.moveUp ) : $('#' + id + '_move_up'),
                $moveDown:      $( settings.moveDown ).length ? $( settings.moveDown ) : $('#' + id + '_move_down')
            };

            delete settings.leftAll;
            delete settings.leftSelected;
            delete settings.right;
            delete settings.rightAll;
            delete settings.rightSelected;
            delete settings.undo;
            delete settings.redo;
            delete settings.moveUp;
            delete settings.moveDown;

            this.options = {
                keepRenderingSort:  settings.keepRenderingSort,
                search:             settings.search,
                ignoreDisabled:     settings.ignoreDisabled !== undefined ? settings.ignoreDisabled : false,
                matchOptgroupBy:    settings.matchOptgroupBy !== undefined ? settings.matchOptgroupBy : 'label'
            };

            delete settings.keepRenderingSort, settings.search, settings.ignoreDisabled, settings.matchOptgroupBy;

            this.callbacks = settings;

            if ( typeof this.callbacks.sort == 'function' ) {
                var sort = this.callbacks.sort;

                this.callbacks.sort = {
                    left: sort,
                    right: sort,
                };
            }

            this.init();
        }

        Multiselect.prototype = {
            init: function() {
                var self = this;
                self.undoStack = [];
                self.redoStack = [];

                if (self.options.keepRenderingSort) {
                    self.skipInitSort = true;

                    if (self.callbacks.sort !== false) {
                        self.callbacks.sort = {
                            left: function(a, b) {
                                return $(a).data('position') > $(b).data('position') ? 1 : -1;
                            },
                            right: function(a, b) {
                                return $(a).data('position') > $(b).data('position') ? 1 : -1;
                            },
                        };
                    }

                    self.$left.attachIndex();

                    self.$right.each(function(i, select) {
                        $(select).attachIndex();
                    });
                }

                if ( typeof self.callbacks.startUp == 'function' ) {
                    self.callbacks.startUp( self.$left, self.$right );
                }

                if ( !self.skipInitSort ) {
                    if ( typeof self.callbacks.sort.left == 'function' ) {
                        self.$left.mSort(self.callbacks.sort.left);
                    }

                    if ( typeof self.callbacks.sort.right == 'function' ) {
                        self.$right.each(function(i, select) {
                            $(select).mSort(self.callbacks.sort.right);
                        });
                    }
                }

                // Append left filter
                if (self.options.search && self.options.search.left) {
                    self.options.search.$left = $(self.options.search.left);
                    self.options.search.$left.appendTo(self.$left.closest('.MultiSelect-Row').prev().find('.MultiSelect-Col--left'));
                }

                // Append right filter
                if (self.options.search && self.options.search.right) {
                    self.options.search.$right = $(self.options.search.right);
                    self.options.search.$right.appendTo(self.$right.closest('.MultiSelect-Row').prev().find('.MultiSelect-Col--right'));
                }

                // Initialize events
                self.events();
                if ( typeof self.callbacks.afterInit == 'function' ) {
                    self.callbacks.afterInit();
                }
            },

            events: function() {
                var self = this;

                // Attach event to left filter
                if (self.options.search && self.options.search.$left) {
                    self.options.search.$left.children('input').on('keyup', function(e) {
                        if (self.callbacks.fireSearch(this.value)) {
                            var $toShow = self.$left.find('option:search("' + this.value + '")').mShow();
                            var $toHide = self.$left.find('option:not(:search("' + this.value + '"))').mHide();
                            var $grpHide = self.$left.find('option').closest('optgroup').mHide();
                            var $grpShow = self.$left.find('option:not(.hidden)').parent('optgroup').mShow();
                        } else {
                            self.$left.find('option, optgroup').mShow();
                        }
                    });
                }

                // Attach event to right filter
                if (self.options.search && self.options.search.$right) {
                    self.options.search.$right.children('input').on('keyup', function(e) {
                        if (self.callbacks.fireSearch(this.value)) {
                            var $toShow = self.$right.find('option:search("' + this.value + '")').mShow();
                            var $toHide = self.$right.find('option:not(:search("' + this.value + '"))').mHide();
                            var $grpHide = self.$right.find('option').closest('optgroup').mHide();
                            var $grpShow = self.$right.find('option:not(.hidden)').parent('optgroup').mShow();
                        } else {
                            self.$right.find('option, optgroup').mShow();
                        }
                    });
                }

                // Attach event for double clicking on options from left side
                self.$left.on('dblclick', 'option', function(e) {
                    e.preventDefault();

                    var $options = self.$left.find('option:selected:not(.hidden)');

                    if ( $options.length ) {
                        self.moveToRight($options, e);
                    }
                });

                // Attach event for clicking on optgroup's from left side
                self.$left.on('click', 'optgroup', function(e) {
                    if ($(e.target).prop('tagName') == 'OPTGROUP') {
                        $(this)
                            .children()
                            .prop('selected', true);
                    }
                });

                // Attach event for pushing ENTER on options from left side
                self.$left.on('keypress', function(e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();

                        var $options = self.$left.find('option:selected:not(.hidden)');

                        if ( $options.length ) {
                            self.moveToRight($options, e);
                        }
                    }
                });

                // Attach event for double clicking on options from right side
                self.$right.on('dblclick', 'option', function(e) {
                    e.preventDefault();

                    var $options = self.$right.find('option:selected:not(.hidden)');

                    if ( $options.length ) {
                        self.moveToLeft($options, e);
                    }
                });

                // Attach event for clicking on optgroup's from right side
                self.$right.on('click', 'optgroup', function(e) {
                    if ($(e.target).prop('tagName') == 'OPTGROUP') {
                        $(this)
                            .children()
                            .prop('selected', true);
                    }
                });

                // Attach event for pushing BACKSPACE or DEL on options from right side
                self.$right.on('keydown', function(e) {
                    if (e.keyCode === 8 || e.keyCode === 46) {
                        e.preventDefault();

                        var $options = self.$right.find('option:selected:not(.hidden)');

                        if ( $options.length ) {
                            self.moveToLeft($options, e);
                        }
                    }
                });

                // dblclick support for IE
                if ( navigator.userAgent.match(/MSIE/i)  || navigator.userAgent.indexOf('Trident/') > 0 || navigator.userAgent.indexOf('Edge/') > 0) {
                    self.$left.dblclick(function(e) {
                        self.actions.$rightSelected.trigger('click');
                    });

                    self.$right.dblclick(function(e) {
                        self.actions.$leftSelected.trigger('click');
                    });
                }

                self.actions.$rightSelected.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$left.find('option:selected:not(.hidden)');

                    if ( $options.length ) {
                        self.moveToRight($options, e);
                    }

                    $(this).blur();
                });

                self.actions.$leftSelected.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$right.find('option:selected:not(.hidden)');

                    if ( $options.length ) {
                        self.moveToLeft($options, e);
                    }

                    $(this).blur();
                });

                self.actions.$rightAll.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$left.children(':not(span):not(.hidden)');

                    if ( $options.length ) {
                        self.moveToRight($options, e);
                    }

                    $(this).blur();
                });

                self.actions.$leftAll.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$right.children(':not(span):not(.hidden)');

                    if ( $options.length ) {
                        self.moveToLeft($options, e);
                    }

                    $(this).blur();
                });

                self.actions.$undo.on('click', function(e) {
                    e.preventDefault();

                    self.undo(e);
                });

                self.actions.$redo.on('click', function(e) {
                    e.preventDefault();

                    self.redo(e);
                });

                self.actions.$moveUp.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$right.find(':selected:not(span):not(.hidden)');

                    if ( $options.length ) {
                        self.moveUp($options, e);
                    }

                    $(this).blur();
                });

                self.actions.$moveDown.on('click', function(e) {
                    e.preventDefault();

                    var $options = self.$right.find(':selected:not(span):not(.hidden)');

                    if ( $options.length ) {
                        self.moveDown($options, e);
                    }

                    $(this).blur();
                });
            },

            moveToRight: function( $options, event, silent, skipStack ) {
                var self = this;

                if ( typeof self.callbacks.moveToRight == 'function' ) {
                    return self.callbacks.moveToRight( self, $options, event, silent, skipStack );
                }

                if ( typeof self.callbacks.beforeMoveToRight == 'function' && !silent ) {
                    if ( !self.callbacks.beforeMoveToRight( self.$left, self.$right, $options ) ) {
                        return false;
                    }
                }

                self.moveFromAtoB(self.$left, self.$right, $options, event, silent, skipStack);

                if ( !skipStack ) {
                    self.undoStack.push(['right', $options ]);
                    self.redoStack = [];
                }

                if ( typeof self.callbacks.sort.right == 'function' && !silent && !self.doNotSortRight ) {
                    self.$right.mSort(self.callbacks.sort.right);
                }

                if ( typeof self.callbacks.afterMoveToRight == 'function' && !silent ) {
                    self.callbacks.afterMoveToRight.call( self, self.$left, self.$right, $options );
                }

                return self;
            },

            moveToLeft: function( $options, event, silent, skipStack ) {
                var self = this;

                if ( typeof self.callbacks.moveToLeft == 'function' ) {
                    return self.callbacks.moveToLeft( self, $options, event, silent, skipStack );
                }

                if ( typeof self.callbacks.beforeMoveToLeft == 'function' && !silent ) {
                    if ( !self.callbacks.beforeMoveToLeft( self.$left, self.$right, $options ) ) {
                        return false;
                    }
                }

                self.moveFromAtoB(self.$right, self.$left, $options, event, silent, skipStack);

                if ( !skipStack ) {
                    self.undoStack.push(['left', $options ]);
                    self.redoStack = [];
                }

                if ( typeof self.callbacks.sort.left == 'function' && !silent ) {
                    self.$left.mSort(self.callbacks.sort.left);
                }

                if ( typeof self.callbacks.afterMoveToLeft == 'function' && !silent ) {
                    self.callbacks.afterMoveToLeft.call( self, self.$left, self.$right, $options );
                }

                return self;
            },

            moveFromAtoB: function( $source, $destination, $options, event, silent, skipStack ) {
                var self = this;

                if ( typeof self.callbacks.moveFromAtoB == 'function' ) {
                    return self.callbacks.moveFromAtoB(self, $source, $destination, $options, event, silent, skipStack);
                }

                $options.each(function(index, option) {
                    var $option = $(option);

                    if (self.options.ignoreDisabled && $option.is(':disabled')) {
                        return true;
                    }

                    if ($option.is('optgroup') || $option.parent().is('optgroup')) {
                        var $sourceGroup = $option.is('optgroup') ? $option : $option.parent();
                        var optgroupSelector = 'optgroup[' + self.options.matchOptgroupBy + '="' + $sourceGroup.prop(self.options.matchOptgroupBy) + '"]';
                        var $destinationGroup = $destination.find(optgroupSelector);

                        if (!$destinationGroup.length) {
                            $destinationGroup = $sourceGroup.clone(true);
                            $destinationGroup.empty();

                            $destination.move($destinationGroup);
                        }

                        if ($option.is('optgroup')) {
                            var disabledSelector = '';

                            if (self.options.ignoreDisabled) {
                                disabledSelector = ':not(:disabled)';
                            }

                            $destinationGroup.move($option.find('option' + disabledSelector));
                        } else {
                            $destinationGroup.move($option);
                        }

                        $sourceGroup.removeIfEmpty();
                    } else {
                        $destination.move($option);
                    }
                });

                return self;
            },

            moveUp: function($options) {
                var self = this;

                if ( typeof self.callbacks.beforeMoveUp == 'function' ) {
                    if ( !self.callbacks.beforeMoveUp( $options ) ) {
                        return false;
                    }
                }

                $options.first().prev().before($options);

                if ( typeof self.callbacks.afterMoveUp == 'function' ) {
                    self.callbacks.afterMoveUp( $options );
                }
            },

            moveDown: function($options) {
                var self = this;

                if ( typeof self.callbacks.beforeMoveDown == 'function' ) {
                    if ( !self.callbacks.beforeMoveDown( $options ) ) {
                        return false;
                    }
                }

                $options.last().next().after($options);

                if ( typeof self.callbacks.afterMoveDown == 'function' ) {
                    self.callbacks.afterMoveDown( $options );
                }
            },

            undo: function(event) {
                var self = this;
                var last = self.undoStack.pop();

                if ( last ) {
                    self.redoStack.push(last);

                    switch(last[0]) {
                        case 'left':
                            self.moveToRight(last[1], event, false, true);
                            break;
                        case 'right':
                            self.moveToLeft(last[1], event, false, true);
                            break;
                    }
                }
            },

            redo: function(event) {
                var self = this;
                var last = self.redoStack.pop();

                if ( last ) {
                    self.undoStack.push(last);

                    switch(last[0]) {
                        case 'left':
                            self.moveToLeft(last[1], event, false, true);
                            break;
                        case 'right':
                            self.moveToRight(last[1], event, false, true);
                            break;
                    }
                }
            }
        }

        return Multiselect;
    })($);

    $.multiselect = {
        defaults: {
            /** will be executed once - remove from $left all options that are already in $right
             *
             *  @method startUp
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
            **/
            startUp: function( $left, $right ) {
                $right.find('option').each(function(index, rightOption) {
                    if ($(rightOption).parent().prop('tagName') == 'OPTGROUP') {
                        var optgroupSelector = 'optgroup[label="' + $(rightOption).parent().attr('label') + '"]';
                        $left.find(optgroupSelector + ' option[value="' + rightOption.value + '"]').each(function(index, leftOption) {
                            leftOption.remove();
                        });
                        $left.find(optgroupSelector).removeIfEmpty();
                    } else {
                        var $option = $left.find('option[value="' + rightOption.value + '"]');
                        $option.remove();
                    }
                });
            },

            /** will be executed after initialize plugin
             *
             *  @method afterInit
             *
             *  @default true
             *  @return {boolean}
             **/
            afterInit: function(){ return true; },

            /** will be executed each time before moving option[s] to right
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveToRight method
             *      false   : stop
             *
             *  @method beforeMoveToRight
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveToRight: function($left, $right, $options) { return true; },

            /*  will be executed each time after moving option[s] to right
             *
             *  @method afterMoveToRight
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveToRight: function($left, $right, $options) {
                var me = this,
                    $allOptions = me.$allOptions;

                $options.each(function () {
                    $allOptions.filter('[value="' + $(this).prop('value') + '"]').prop('selected', true);
                });

                this.numSelected += $options.length;

                if (me.numSelected === me.numAll) {
                    $allOptions.first().prop('selected', true);
                    $allOptions.slice(1).prop('selected', false);
                }
            },

            /** will be executed each time before moving option[s] to left
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveToRight method
             *      false   : stop
             *
             *  @method beforeMoveToLeft
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveToLeft: function($left, $right, $options) { return true; },

            /*  will be executed each time after moving option[s] to left
             *
             *  @method afterMoveToLeft
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveToLeft: function($left, $right, $options) {
                var me = this,
                    $allOptions = me.$allOptions;

                if (me.numSelected === me.numAll) {
                    $allOptions.first().prop('selected', false);
                    $allOptions.slice(1).prop('selected', true);
                }

                $options.each(function () {
                    $allOptions.filter('[value="' + $(this).prop('value') + '"]').prop('selected', false);
                });

                me.numSelected -= $options.length;
            },

            /** will be executed each time before moving option[s] up
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveUp method
             *      false   : stop
             *
             *  @method beforeMoveUp
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveUp: function($options) { return true; },

            /*  will be executed each time after moving option[s] up
             *
             *  @method afterMoveUp
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveUp: function($options) {},

            /** will be executed each time before moving option[s] down
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveUp method
             *      false   : stop
             *
             *  @method beforeMoveDown
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveDown: function($options) { return true; },

            /*  will be executed each time after moving option[s] down
             *
             *  @method afterMoveUp
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveDown: function($options) {},

            /** sort options by option text
             *
             *  @method sort
             *  @attribute a HTML option
             *  @attribute b HTML option
             *
             *  @return 1/-1
            **/
            sort: function(a, b) {
                if (a.innerHTML == 'NA') {
                    return 1;
                } else if (b.innerHTML == 'NA') {
                    return -1;
                }

                return (a.innerHTML > b.innerHTML) ? 1 : -1;
            },

            /*  will tell if the search can start
             *
             *  @method fireSearch
             *  @attribute value String
             *
             *  @return {boolean}
            **/
            fireSearch: function(value) {
                return value.length > 1;
            },

            searchEnabled: false
        }
    };

    var ua = window.navigator.userAgent;
    var isIE = (ua.indexOf("MSIE ") + ua.indexOf("Trident/") + ua.indexOf("Edge/")) > -3;
    var isSafari = ua.toLowerCase().indexOf("safari") > -1;
    var isFirefox = ua.toLowerCase().indexOf("firefox") > -1;

    $.fn.multiselect = function( options ) {
        return this.each(function() {
            var $this    = $(this),
                data     = $this.data('crlcu.multiselect'),
                settings = $.extend({}, $.multiselect.defaults, $this.data(), (typeof options === 'object' && options));

            if (settings.searchEnabled === true) {
                settings.search = {
                    left: searchHtml,
                    right: searchHtml
                };
            }

            if (!data) {
                $this.data('crlcu.multiselect', (data = new Multiselect($this, settings)));
            }
        });
    };

    // append options
    // then set the selected attribute to false
    $.fn.move = function( $options ) {
        this
            .append($options)
            .find('option')
            .prop('selected', false);

        return this;
    };

    $.fn.removeIfEmpty = function() {
        if (!this.children().length) {
            this.remove();
        }

        return this;
    };

    $.fn.mShow = function() {
        this.removeClass('hidden').show();

        if (isIE || isSafari) {
            this.each(function(index, option) {
                // Remove <span> to make it compatible with IE
                if($(option).parent().is('span')) {
                    $(option).parent().replaceWith(option);
                }

                $(option).show();
            });
        }
        if(isFirefox){
            this.attr('disabled', false)
        }

        return this;
    };

    $.fn.mHide = function() {
        this.addClass('hidden').hide();

        if (isIE || isSafari) {
            this.each(function(index, option) {
                // Wrap with <span> to make it compatible with IE
                if(!$(option).parent().is('span')) {
                    $(option).wrap('<span>').hide();
                }
            });
        }
        if(isFirefox){
            this.attr('disabled', true)
        }
        return this;
    };

    // sort options then reappend them to the select
    $.fn.mSort = function(callback) {
        this
            .children()
            .sort(callback)
            .appendTo(this);

        this
            .find('optgroup')
            .each(function(i, group) {
                $(group).children()
                    .sort(callback)
                    .appendTo(group);
            })

        return this;
    };

    // attach index to children
    $.fn.attachIndex = function() {
        this.children().each(function(index, option) {
            var $option = $(option);

            if ($option.is('optgroup')) {
                $option.children().each(function(i, children) {
                    $(children).data('position', i);
                });
            }

            $option.data('position', index);
        });
    };

    $.expr[":"].search = function(elem, index, meta) {
        var regex = new RegExp(meta[3].replace(/([^a-zA-Z0-9])/g, "\\$1"), "i");

        return $(elem).text().match(regex);
    }

    $(function () { $('[data-role="multiselect"]').multiselect({ sort: false }); });
}));
