/*
  scholarly
    app
      scripts
        controllers
          * WordsCtrl.js
  +---------------------------------------------------------------------------
    * WordsCtrl.js
        A controller to handle the 'words' state.
  ---------------------------------------------------------------------------+
*/

(function() {
  function WordsCtrl(UserWords, Words, $scope, $firebaseArray, $http) {

    var that = this;

    this.searchUserWord = "";
    this.userWords = [];

    /*
      0 => alpha A-Z
      1 => alpha Z-A
      2 => numSuccess (lowest to high)
      3 => numSuccess (highest to low)
    */
    this.sortBy = 0;


    this.scrollMem = 0;

    function initSearchVars() {
      that.searchAddWord = "";
      that.searchResults = [];
      that.searchPending = false;
      that.searchErrorFlag = false;
    }

    initSearchVars();

    this.sortByOrder = function() {
      return (that.sortBy < 2 ) ? '-name' : '-numSuccess';
    }

    this.sortByReversed = function() {
      return (that.sortBy % 2 == 0) ? true : false;
    }

    this.clearSearchUserWord = function() {
      that.searchUserWord = "";
    }

    /*
      btnSortUserWords()
        => Iterates 'this.sortBy' to the next sort category.
    */
    this.btnSortUserWords = function() {
      that.sortBy++;
      if (that.sortBy > 3) { that.sortBy = 0; }
    }

    /*

    */
    this.attachBtnOpenAddWordResponsiveness = function() {
      var userWordsBox = document.getElementById('user-words-box');
      var btnNav = document.getElementById('btn-open-add-word');
      userWordsBox.onscroll = function() {
        if (userWordsBox.scrollTop > that.scrollMem) {
          btnNav.style.opacity = '0';
        } else {
          btnNav.style.opacity = '1';
        }
        that.scrollMem = userWordsBox.scrollTop;
      }
    }

    this.btnOpenAddWord = function(searchWord) {
      if (document.getElementById('btn-open-add-word').style.opacity === '0') {
        return;
      }

      // transition view
      document.getElementById('words-view').style.left = '100%';
      document.getElementById('add-word-view').style.left = '0';
      document.getElementById('add-word-input').focus();

      // implement nav button responsiveness
      var searchResultsBox = document.getElementById('search-results-box');
      var btnNav = document.getElementById('btn-return-to-words');
      searchResultsBox.onscroll = function() {
        if (searchResultsBox.scrollTop > that.scrollMem) {
          btnNav.style.opacity = '0';
        } else {
          btnNav.style.opacity = '1';
        }
        that.scrollMem = searchResultsBox.scrollTop;
      }

      // trigger auto-search
      if (searchWord) {
        that.searchAddWord = searchWord;
        that.searchWord();
      }
    }

    this.btnReturnToWords = function() {
      if (document.getElementById('btn-return-to-words').style.opacity === '0') {
        return;
      }

      // transition view
      document.getElementById('words-view').style.left = '0';
      document.getElementById('add-word-view').style.left = '-100%';
      document.getElementById('form-add-word-search').reset();
      that.scrollMem = 0;
      initSearchVars();

      // implement nav button responsiveness
      that.attachBtnOpenAddWordResponsiveness();
    }

    this.searchWord = function() {
      that.searchResults = [];
      that.searchErrorFlag = false;
      that.searchPending = true;
      Words.getDefinitions(that.searchAddWord).then(function(value) {
        that.searchResults = value;
        that.searchErrorFlag = (typeof(value) === 'string');
        that.searchPending = false;
      });
      document.getElementById('add-word-input').blur();
    }

    this.btnAddWord = function(result) {
      if (UserWords.hasWord(that.searchAddWord)) {
        alert('already have that word');
      } else {
        var wordObject = {
          name: that.searchAddWord,
          partOfSpeech: result.partOfSpeech,
          definition: result.definition
        }
        if (UserWords.addWord(wordObject)) {
          alert('added ' + that.searchAddWord + '!');
          that.btnReturnToWords();
        } else {
          alert("didn't work");
        };

      }
    }

    // load 'userWords' as soon as user detected
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        UserWords.getWords().then(function(val) {
          that.userWords = val;
        });
      }
    })

  }

  angular
    .module('scholarly')
    .controller('WordsCtrl', ['UserWords', 'Words', '$scope', '$firebaseArray', '$http', WordsCtrl]);
})();