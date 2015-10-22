(function () {

  angular.module('ionicApp', ['ionic', 'ngResource', 'ngCordova', 'uiGmapgoogle-maps'])
    .run(function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleLightContent();
        }
      });
    })
    .config(function ($stateProvider, $urlRouterProvider, $compileProvider, uiGmapGoogleMapApiProvider) {

      $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|ms-appdata):|data:image\//);

      uiGmapGoogleMapApiProvider.configure({
        //key: 'Your-Api-Key-Goes-Here',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
      });

      $stateProvider.state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'partials/tabs.html'
      })
        .state('tab.rss', {
          url: '/rss',
          views: {
            'tab-rss': {
              templateUrl: 'partials/tab-rss.html',
              controller: 'RssCtrl'
            }
          }
        })
        .state('tab.rss-entry', {
          url: '/rss/:index',
          views: {
            'tab-rss': {
              templateUrl: 'partials/tab-rss-entry.html',
              controller: 'EntryCtrl'
            }
          }
        })
        .state('tab.camera', {
          url: '/camera',
          views: {
            'tab-camera': {
              templateUrl: 'partials/tab-camera.html',
              controller: 'CameraCtrl'
            }
          }
        })
        .state('tab.location', {
          url: '/location',
          views: {
            'tab-location': {
              templateUrl: 'partials/tab-location.html',
              controller: 'LocationCtrl'
            }
          }
        });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/tab/rss');

    })
    .factory('FeedLoader', [
      '$resource', '$q', function ($resource, $q) {

        var feed = {};

        var updateFeed = function (options) {
          var res = $q.defer();
          $resource('http://ajax.googleapis.com/ajax/services/feed/load', {}, {
            fetch: { method: 'GET', params: { v: '1.0' } }
          }).fetch(options, {}, function (data) {
            feed = data.responseData.feed;
            res.resolve(feed);
          });
          return res.promise;
        }

        var getFeed = function () {
          return feed;
        }

        return {
          getFeed: getFeed,
          updateFeed: updateFeed
        }
      }
    ])
  .factory('GeoService', function ($ionicPlatform, $cordovaGeolocation) {

    var positionOptions = { timeout: 10000, enableHighAccuracy: true };

    return {
      getPosition: function () {
        return $ionicPlatform.ready()
          .then(function () {
            return $cordovaGeolocation.getCurrentPosition(positionOptions);
          })
      }
    };

  })

    .controller('RssCtrl', [
      '$scope', 'FeedLoader', function ($scope, FeedLoader) {
        $scope.feed = {};

        $scope.doRefresh = function () {

          FeedLoader.updateFeed({ q: 'http://dotnetautor.de/GetRssFeed', num: 10 }).then(function (data) {
            $scope.feed = data;
            console.log($scope.feed);
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
          });
        };

        $scope.doRefresh();

      }
    ])
    .controller('EntryCtrl', [
      '$scope', '$stateParams', 'FeedLoader', function ($scope, $stateParams, FeedLoader) {

        $scope.index = $stateParams.index;
        $scope.entry = FeedLoader.getFeed().entries[$scope.index];

        $scope.readEntry = function (e) {
          window.open(e.link, "_blank");
        };

      }
    ])
    .controller('LocationCtrl', function ($scope, GeoService, uiGmapGoogleMapApi) {

      $scope.map = { center: { latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
      $scope.options = { scrollwheel: false };

      function showMap(coords) {
        uiGmapGoogleMapApi.then(function (maps) {
          $scope.map = {
            center: { latitude: coords.latitude, longitude: coords.longitude },
            zoom: 8
          };
        });
      }

      GeoService.getPosition()
        .then(function (position) {
          $scope.coords = position.coords;
          showMap(position.coords);
        }, function (err) {
          console.log('getCurrentPosition error: ' + angular.toJson(err));
        });

    })
    .controller('CameraCtrl', function ($scope, $cordovaCamera, $timeout) {
      $scope.images = [];

      $scope.addImage = function () {
        var options = {
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
        };

        $cordovaCamera.getPicture(options).then(function (fileURI) {

          $timeout(function () {
            $scope.images.push(fileURI);
          });


        }, function (err) {

        });
      }
    });
})()