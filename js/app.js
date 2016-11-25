var map;
var markers = [];
var largeInfowindow;
var bounds;
var defaultIcon;
var highlightedIcon;
var center;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.768433,
            lng: -73.525125
        },
        maxZoom: 10 //keeps map.fitbounds(bounds) from making the zoom higher than 10
    });

    largeInfowindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    // Style the markers a bit. This will be our listing marker icon.
    defaultIcon = makeMarkerIcon('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|6107F5|40|_|%E2%80%A2');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    highlightedIcon = makeMarkerIcon('http://www.clipartkid.com/images/2/download-png-image-maple-png-leaf-fWWFLD-clipart.png');
    // The following group uses the location array to create an array of markers on initialize.
    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(map.center);
        if (map.getZoom() > 9) {
            map.fitBounds(bounds);
        }
    });

    // Maps api asynchronous load code here.

    ko.applyBindings(new ViewModel());

}

var ViewModel = function() {
    var self = this;

    this.isOpen = ko.observable(false);

    //indicates if the list window is open
    this.toggle = function() {
        this.isOpen(!this.isOpen());
    };

    //close list window
    this.close = function() {
        this.isOpen(false);
        return true;
    };
    this.highlightIcon = function(){
      this.marker.setIcon(highlightedIcon);
    }
    this.resetIcon = function(){
      this.marker.setIcon(defaultIcon);
    }

    //set clicked marker as the current marker
    this.currentMarker = function() {
      this.marker.setIcon(highlightedIcon);
      this.marker.clicked = true;
      self.populateInfoWindow(this.marker, largeInfowindow);
    }

    //toggles the filter options
    this.filtersVisible = ko.observable(false);

    //filters: show locations in Nassau County or Suffolk County
    this.suffolk = ko.observable(true);
    this.nassau = ko.observable(true);

    //Nature Centers in Long Island Array
    this.locations = ko.observableArray([{
        title: 'Caleb Smith State Park Preserve, 581 West Jericho Turnpike, Smithtown, NY 11787',
        location: {
            lat: 40.848614,
            lng: -73.230747
        },
        county: 'Suffolk',
        marker: null,
        visible: true
    }, {
        title: 'Theodore Roosevelt Nature Center at Jones Beach State Park, Jones Beach State Parks, Hempstead, NY 11793',
        location: {
            lat: 40.588192,
            lng: -73.546417
        },
        county: 'Nassau',
        marker: null,
        visible: true
    }, {
        title: 'WaterFront Center, 1 West End Ave, Oyster Bay, NY 11771',
        location: {
            lat: 40.875699,
            lng: -73.539744
        },
        county: 'Nassau',
        marker: null,
        visible: true
    }, {
        title: 'Wertheim National Wildlife Refuge, 340 Smith Rd, Shirley, NY 11967',
        location: {
            lat: 40.787021,
            lng: -72.8929
        },
        county: 'Suffolk',
        marker: null,
        visible: true
    }, {
        title: 'Sands Point Preserve, 127 Middle Neck Rd, Sands Point, NY 11050',
        location: {
            lat: 40.85595,
            lng: -73.70053
        },
        county: 'Nassau',
        marker: null,
        visible: true
    }, {
        title: 'Massapequa Preserve, N. Richmond Ave, North Massapequa, NY 11758',
        location: {
            lat: 40.694075,
            lng: -73.456573
        },
        county: 'Nassau',
        marker: null,
        visible: true
    }]);

    //populate info window with location info retrieved from Flickr and Wikipedia APIs
    self.populateInfoWindow = function(marker, infowindow) {
        map.fitBounds(bounds);
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            var address = getSearchTerms(marker.title);
            var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + address.wikiSrcTxt + "&limit=1&redirects=resolve&namespace=0&format=json"
            var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&sort=relevance&api_key=dc67acf839a879ed25b6a5fd29db7741&text=' + address.flickrSrcTxt + '&format=json&safe_search=1&per_page=20';

            //timeout function if API doesn't respond
            self.apiTimeout = setTimeout(function() {
                alert('ERROR: Failed to load data');
            }, 5000);

            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
            }).success(function(data) {
                var wiki;
                if (data[2].length != 0) {
                    var wikiInfo = {
                        summary: data[2],
                        url: data[3]
                    };
                    var wiki = '<p>' + wikiInfo.summary + '</p><p><a href="' + wikiInfo.url + '">' + wikiInfo.url + '</a></p>';
                } else {
                    wiki = '<p>No Wikipedia Info Available</p>';
                }
                $.ajax({
                    url: flickrUrl,
                    dataType: 'jsonp',
                    jsonp: 'jsoncallback',
                }).then(function(data, status, xhr) {
                    var image = "";
                    //if there is flickr data available load the picure otherwise indicate in infowindow that there isn't anything available
                    if (data.photos.photo[0]) {
                        var photo = data.photos.photo[0];
                        image = '<img src="https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_t.jpg"</img>';
                    } else {
                        image = '<p>No Flickr Image Available</p>';
                    }
                    //generate info window based on content obtained from APIs
                    generateIWContent(image, marker, wiki);
                    //clear timeout since flickr and wikipedia APIs were a success
                    clearTimeout(self.apiTimeout);
                });
            });
        }

        var generateIWContent = function(image, marker, wiki) {
            infowindow.setContent('<div class = "info-window"><p class = "iw-img">' + image + '<h4>' + marker.title + '</h4>' + wiki + '</p></div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                marker.setIcon(defaultIcon);
                marker.clicked = false;
                infowindow.marker = null;
                map.setCenter(map.center);
                map.fitBounds(bounds);
            });
            //close infowindow if map is clicked
            google.maps.event.addDomListener(map, 'click', function() {
                marker.setIcon(defaultIcon);
                marker.clicked = false;
                infowindow.marker = null;
                infowindow.close();
                map.fitBounds(bounds);
            });

            //for mobile app, if list window is open, pan map down so there is enough clearance for the infowindow
            if ((self.isOpen) && ($(window).width() < 550)) {
                map.panBy(0, -140);
            }
            if ((self.isOpen) && ($(window).width() > 550)) {
                map.panBy(-200, 0);
            }
        }
    };

    //continuously check if filters have been changed
    this.nassau.subscribe(function() {
        for (var i = 0; i < self.locations().length; i++) {
          self.locations()[i].marker.setVisible(checkFilter(self.locations()[i], self.nassau(), "Nassau"));
        }
    });

    this.suffolk.subscribe(function() {
        for (var i = 0; i < self.locations().length; i++) {
          self.locations()[i].marker.setVisible(checkFilter(self.locations()[i], self.suffolk(), "Suffolk"));
        }
    });

    var checkFilter = function(loc, toggledCounty, filter){
          var cnty = loc.county;
          if (toggledCounty){
            if (cnty == filter){
              return true;
            }
          } else if (cnty == filter){
            return false;
          }
        }

    self.createMarkers = function() {
        for (var i = 0; i < self.locations().length; i++) {
            // Get the position from the location array.
            var position = self.locations()[i].location;
            var title = self.locations()[i].title;
            // Create a marker per location, and put into markers array.
            marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                id: i,
                clicked: false
            });
            markers.push(marker);
            self.locations()[i].marker = marker;

            marker.addListener('click', function() {
                self.populateInfoWindow(this, largeInfowindow);
                this.clicked = true;
            });

            marker.addListener('mouseover', function() {
                 this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
              console.log(this.clicked);
              if (!this.clicked){
                this.setIcon(defaultIcon);
              }
            });

            bounds.extend(marker.position);
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);

    }
    self.createMarkers();

};

//parse locations array to format it for ajax requests
function getSearchTerms(loc) {
    var fullLoc = loc.split(",");

    for (var i = 0; i < fullLoc.length; i++) {
        fullLoc[i] = fullLoc[i].replace(/ /g, "+");
        fullLoc[i] = fullLoc[i].toLowerCase();
    }
    var address = {
        flickrSrcTxt: fullLoc[0] + fullLoc[2] + '+ny',
        wikiSrcTxt: fullLoc[0]
    }

    return address;
}

function makeMarkerIcon(image) {
    var markerImage = new google.maps.MarkerImage(
        image,
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function googleError() {

    alert("Google Maps Not Loading, Please check internet connection");
}