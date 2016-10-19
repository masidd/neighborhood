

     var vm = function() {
      var self=this;

      this.isOpen = ko.observable(false);

      this.toggle = function() {
        this.isOpen(!this.isOpen());
      };

      this.close = function() {
        this.isOpen(false);
      };

      self.currentMarker = function(){
        self.populateInfoWindow(this.marker,largeInfowindow);
      }

      this.suffolk = ko.observable(true);
      this.nassau = ko.observable(true);

      self.filterResults = function(){
      /*  for (var i = 0; i<self.locations.length; i++){
          if (self.location[i].county == 'Suffolk'){
            if (!self.suffolk){
              self.visible = false;
            } else self.visible = true;
          } /*else {
            if (!self.nassau){
              if self.visible = false;
            } else self.visible = true;
          }
        }*/

      };

      this.locations = ko.observableArray( [
          {title: 'Caleb Smith State Park Preserve, 581 West Jericho Turnpike, Smithtown, NY 11787', location: {lat: 40.848614, lng: -73.230747}, county: 'Suffolk', marker:null},
          {title: 'Theodore Roosevelt Nature Center at Jones Beach State Park, Jones Beach State Parks, Hempstead, NY 11793', location: {lat: 40.588192, lng: -73.546417}, county: 'Nassau', marker:null},
          {title: 'WaterFront Center, 1 West End Ave, Oyster Bay, NY 11771', location: {lat: 40.875699, lng: -73.539744}, county: 'Nassau', marker:null},
          {title: 'Wertheim National Wildlife Refuge, 340 Smith Rd, Shirley, NY 11967', location: {lat: 40.787021, lng: -72.8929}, county: 'Suffolk', marker:null},
          {title: 'Sands Point Preserve, 127 Middle Neck Rd, Sands Point, NY 11050', location: {lat: 40.85595, lng: -73.70053}, county: 'Nassau', marker:null},
          {title: 'Massapequa Preserve, N. Richmond Ave, North Massapequa, NY 11758', location: {lat: 40.694075, lng: -73.456573}, county: 'Nassau', marker:null}
        ]);

      self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          var address = getSearchTerms(marker.title);
          var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+address.wikiSrcTxt+"&limit=1&redirects=resolve&namespace=0&format=json"
          var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&sort=relevance&api_key=dc67acf839a879ed25b6a5fd29db7741&text='+address.flickrSrcTxt+'&format=json&safe_search=1&per_page=20';
          $.ajax( {
            url: wikiUrl,
            dataType: 'jsonp',
          } ).success(function(data) {
          var wikiInfo = {
            summary : data[2],
            url : data[3]
          };

          $.ajax({
            url: flickrUrl,
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
          }).then(function(data, status, xhr) {
            var image = "";
            //error handling : create image URL only if there are any Flickr search results
            if(data.photos.photo[0]){
              var photo = data.photos.photo[0];
              image = 'https://farm' + photo.farm +'.staticflickr.com/'+ photo.server +'/'+ photo.id+'_'+ photo.secret+'_t.jpg';
            }
            infowindow.setContent('<div><div>' + marker.title + '</div><div>' + wikiInfo.summary + '</div><div><a href="' + wikiInfo.url + '">' + wikiInfo.url + '</a></div><div><img src="' + image + '"</img></div></div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick',function(){
            infowindow.marker = null;
          });
        },
        function(xhr, status, error) {
           console.log('failed (promises): ' + error);
        });
        });
      }
    };
       for (var i = 0; i < this.locations().length; i++) {
          // Get the position from the location array.
          var position = this.locations()[i].location;
          var title = this.locations()[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });
          this.locations()[i].marker = marker;

          marker.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow);
          });

          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });

          bounds.extend(marker.position);
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
    };



    var map;
    var markers = [];
    var largeInfowindow;
    var bounds;
    var defaultIcon;
    var highlightedIcon;
    var center;

    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.768433, lng: -73.525125},
        zoom: 10
      });

      largeInfowindow = new google.maps.InfoWindow();
      bounds = new google.maps.LatLngBounds();
      // Style the markers a bit. This will be our listing marker icon.
      defaultIcon = makeMarkerIcon('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|6107F5|40|_|%E2%80%A2');

      // Create a "highlighted location" marker color for when the user
      // mouses over the marker.
      highlightedIcon = makeMarkerIcon('http://www.clipartkid.com/images/2/download-png-image-maple-png-leaf-fWWFLD-clipart.png');
      // The following group uses the location array to create an array of markers on initialize.
      google.maps.event.addDomListener(window, 'resize',function(){
        map.setCenter(map.center);
        map.fitBounds(bounds);
      });

      ko.applyBindings(new vm());

    }

   function getSearchTerms(loc){
      var fullLoc = loc.split(",");

      for (var i = 0; i<fullLoc.length; i++){
        fullLoc[i] = fullLoc[i].replace(/ /g,"+");
        fullLoc[i] = fullLoc[i].toLowerCase();
      }
      var address = {
        flickrSrcTxt : fullLoc[0] + fullLoc[2] + '+ny',
        wikiSrcTxt : fullLoc[0]
      }

      return address;
    }

      function makeMarkerIcon(image) {
        var markerImage = new google.maps.MarkerImage(
          image,
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
