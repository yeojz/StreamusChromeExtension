﻿//  Background.js is a bit of a dumping ground for code which needs a permanent housing spot.
define([
    'background/commands',
    'background/collection/searchResults',
    'background/collection/streamItems',
    'background/collection/playlists',
    'background/model/player',
    'background/model/settings',
    'background/model/user',
    'background/model/buttons/nextButton',
    'background/model/buttons/previousButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/playPauseButton',
    'background/model/buttons/shuffleButton',
    'background/model/buttons/repeatButton',
    'background/model/buttons/radioButton',
    'background/model/contextMenus',
    'background/model/clientError',
    'background/model/iconManager',
    'background/model/omnibox',
    'background/model/user',
    'background/view/clipboardView'
], function (Commands, SearchResults, StreamItems, Playlists, Player, Settings, User, NextButton, PreviousButton, PlayPauseButton, ShuffleButton, RepeatButton, RadioButton) {
    'use strict';
   
    window.clearResultsTimeout = null;
    var tenSeconds = 10000;
    
    //  The foreground has to be able to call this whenever a view opens.
    window.stopClearResultsTimer = function () {
        clearTimeout(window.clearResultsTimeout);
    };

    //  It's important to write this to the background page because the foreground gets destroyed so it couldn't possibly remember it.
    window.startClearResultsTimer = function () {
        //  Safe-guard against multiple setTimeouts, just incase.
        window.stopClearResultsTimer();

        window.clearResultsTimeout = setTimeout(function () {
            Settings.set('searchQuery', '');
            SearchResults.clear();
        }, tenSeconds);
    };
    
    //  I know this sucks. It's because of a 'bug' in chrome extensions where foreground can't reliably unsubscribe all of its events so the background has to be responsible for it. :(
    window.unbindViewEvents = function (foregroundViewType) {

        var collectionsToUnbind = [StreamItems, SearchResults, Playlists];
        var allToUnbind = [Player, User, Settings, NextButton, PreviousButton, PlayPauseButton, ShuffleButton, RepeatButton, RadioButton];

        _.each(collectionsToUnbind, function(collectionToUnbind) {
            allToUnbind.push(collectionToUnbind);

            collectionToUnbind.each(function (modelToUnbind) {
                allToUnbind.push(modelToUnbind);
            });
        });

        _.each(allToUnbind, function (toUnbind) {

            var viewContexts = [];

            _.each(toUnbind._events, function (eventGroup) {

                _.each(_.toArray(eventGroup), function (event) {
                    
                    if (event.ctx instanceof foregroundViewType) {
                        if (viewContexts.indexOf(event.ctx) === -1) {
                            viewContexts.push(event.ctx);
                        }
                    }
                    
                });

            });

            _.each(viewContexts, function (viewContext) {
                viewContext.stopListening();
            });

            viewContexts.length = 0;
        });

    };

});