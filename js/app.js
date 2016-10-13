

     var vm = function() {
      var self=this;

      console.log("hi");
      this.isOpen = ko.observable(false);
      console.log(this.isOpen());

      this.toggle = function() {
        console.log("before:" + this.isOpen());
        this.isOpen(!this.isOpen());
        console.log("after:" + this.isOpen());
      };

      this.close = function() {
        this.isOpen(false);
      };

      self.currentMarker = function(){
        self.populateInfoWindow(this.marker,largeInfowindow);
      }

      this.locations = ko.observableArray( [
          {title: 'Caleb Smith State Park Preserve, 581 West Jericho Turnpike, Smithtown, NY 11787', location: {lat: 40.848614, lng: -73.230747}, marker:null},
          {title: 'Theodore Roosevelt Nature Center at Jones Beach State Park, Jones Beach State Parks, Hempstead, NY 11793', location: {lat: 40.588192, lng: -73.546417}, marker:null},
          {title: 'WaterFront Center, 1 West End Ave, Oyster Bay, NY 11771', location: {lat: 40.875699, lng: -73.539744}, marker:null},
          {title: 'Wertheim National Wildlife Refuge, New York, USA', location: {lat: 40.787021, lng: -72.8929}, marker:null},
          {title: 'Sands Point Preserve, 127 Middle Neck Rd, Sands Point, NY 11050', location: {lat: 40.85595, lng: -73.70053}, marker:null},
          {title: 'Massapequa Preserve, North Massapequa, NY 11758', location: {lat: 40.694075, lng: -73.456573}, marker:null}
        ]);

      self.populateInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          var wikiUrl = getWikiUrl(marker.title);
          var googleUrl = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAHnHf6UwnpXNAOL5Ye7HDCkuLel3cdky4&cx=010463991830776209284:o1tbqluxrtw&q=' + marker.title + '&searchType=image&fileType=jpg&imgSize=small&alt=json';
          console.log(googleUrl);
          $.ajax( {
            url: wikiUrl,
            dataType: 'jsonp',
          } ).success(function(data) {
          var wikiInfo = {
            summary : data[2],
            url : data[3]
          };

          $.ajax({
            url: googleUrl,
            dataType: 'jsonp',
          }).success(function(data){
            console.log(data.items[0].link);
            infowindow.setContent('<div>' + marker.title + '</div><div>' + wikiInfo.summary + '</div><div><a href="' + wikiInfo.url + '">' + wikiInfo.url + '</a><img src="' + data.items[1].link + '"</img></div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick',function(){
            infowindow.marker = null;
          });
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

      ko.applyBindings(new vm());

    }


   function getWikiUrl(loc){
      var locationName = loc.split(",")[0];
      remoteUrlWithOrigin = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+locationName+"&limit=1&redirects=resolve&namespace=0&format=json";

      console.log("jsonURL = " + remoteUrlWithOrigin);
      return remoteUrlWithOrigin;
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
