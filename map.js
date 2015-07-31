  // Put your zillow.com API key here

var zwsid = "X1-ZWz1dwxpdjrzt7_1brbp";
var request = new XMLHttpRequest();
var request1 = new XMLHttpRequest();
var map;
var markers = [];
var geocoder;

//async loading: google maps api is loaded after page has finished laoding
//loadscript creates google maps api
window.onload = loadScript;

function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  //sensor indicates whether this app uses a sensor(GPS) to determine users location
  //initialize function is executed when api is fully loaded
  //passing google api key
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCqLm6nu_Re1G8doZG1jLRgftz_NDBxrco&sensor=false&callback=initialize';
  document.body.appendChild(script);
}

function initialize() {
  geocoder = new google.maps.Geocoder();
  //initialize a map, required options are center and zoom
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(32.75, -97.13),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  //creates new map inside given HTML container "map-canvas" using parameters passed(mapOptions)
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  //addMarker called on every click on the map
  google.maps.event.addListener(map, 'click', function(event) { addMarker(event.latLng); });
}

function addMarker(location) {
  geocoder.geocode({'latLng': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        f_address = results[0].formatted_address;
        var address = encodeURI( f_address );
        request1.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+"+"+"+", false);
        request1.withCredentials = "true";
        request1.send(null);
        var xml1 = request1.responseXML.documentElement;  
        var value1 = xml1.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0];
        //for address with valid zestimate value
        if (xml_to_string(value1).length > 24) {
          //map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
            position: location,
            map: map
          });
          markers.push(marker);
          var infowindow = new google.maps.InfoWindow({
            content: f_address + " " + "Zestimate price : $" + xml_to_string(value1)
          });
          infowindow.open(map, marker);
          google.maps.event.addListener(marker, 'click', function(){
            infowindow.open(map, marker);
          })
          document.getElementById("output").innerHTML += "Address : " + f_address + " " + "Zestimate Value : $" + xml_to_string(value1) + "<br>";
        } 
        //address with no zestimate value
        else{
          alert('This address has no Zestimate Value');
        }
      }
    }
    else {
      alert("Geocoder failed due to: " + status);
    }
  });
}    

// convert xml value to string and return
function xml_to_string ( xml_node ) {
  if (xml_node.xml)
    return xml_node.xml;
    var xml_serializer = new XMLSerializer();
    return xml_serializer.serializeToString(xml_node);
}

function displayResult () {
  if (request.readyState == 4) {
    var address1 = document.getElementById("address").value;
    var city = document.getElementById("city").value;
    var state = document.getElementById("state").value;
    var zipcode = document.getElementById("zipcode").value;
    var address = address1 + ', ' + city + ', ' + state + ', ' + zipcode;
    geocoder.geocode( {'address': address}, function(results, status){
      if (status == google.maps.GeocoderStatus.OK){
        //for address with valid zestimate value
        if (xml_to_string(value).length > 24) {
          //create marker at this location
          var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
          });
          //add this marker to markers array
          markers.push(marker);
          //create an infowindow with address and zestimate value
          var infowindow = new google.maps.InfoWindow({
            content: address + " " + "Zestimate price : $" + xml_to_string(value)
          });
          //open an infowindow on this marker with address and zestimate value
          infowindow.open(map, marker);
          //to open infowindow again by clicking on the marker
          google.maps.event.addListener(marker, 'click', function(){
            infowindow.open(map, marker);
          })
          //innerHTML property sets or returns the HTML content (inner HTML) of an element
          //append this address and zestimate value to text area
          document.getElementById("output").innerHTML += "Address : " + address + " " + "Zestimate Value : $" + xml_to_string(value) + "<br>";
        }
        //address with no zestimate value
        else{
          alert('This address has no Zestimate Value');
        }
      } 
      else{
        alert('Geocode was not successful because of:' + status);
      }
    });
    //parse the xml for zestimate amount
    var xml = request.responseXML.documentElement;
    var value = xml.getElementsByTagName("zestimate")[0].getElementsByTagName("amount")[0];
    request.readyState == 0;
  }
}

//to find a particular address which has valid zestimate value
function find () {
  request.onreadystatechange = displayResult;
  var address = document.getElementById("address").value;
  var city = document.getElementById("city").value;
  var state = document.getElementById("state").value;
  var zipcode = document.getElementById("zipcode").value;
  //AJAX call to zillow server using zillow id and address
  request.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+city+"+"+state+"+"+zipcode);
  request.withCredentials = "true";
  request.send(null);
}

/*function onclickmap(address1){
    var address = encodeURI( address1 );
    request.open("GET","proxy.php?zws-id="+zwsid+"&address="+address+"&citystatezip="+"+"+"+", false);
    request.withCredentials = "true";
    request.send(null);
}*/

//delete all markers and clear text area
function clearall () {
  while (markers.length > 0) {
    markers.pop().setMap(null);
  }
  markers.length = 0;
  document.getElementById("output").innerHTML = "";
}