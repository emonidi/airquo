<script>
  import { onMount } from "svelte";
  import AppHeader from "./Header.svelte";
  import Map from "./Map.svelte";
  import Marker from "./Marker.svelte";
  import { stationId, station } from "./stores/LocationStore";
  import StationDetails from "./StationDetails.svelte";
  import {stations, fetchStations} from './stores/StationsStore'
  import {currentRoute} from './stores/UIStore';
  import {Router, Link, Route} from 'svelte-routing';
  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim
  } from "@smui/drawer";

  import IconButton from "@smui/icon-button";

  
  let firstDataFetched = false;
  let data = [];
  let coordinates;
  let zoom = 2;
  let shouldOpenDrawer = false;

  stations.subscribe(st => {
    data = st;
  })

  currentRoute.subscribe(routeString => {
     shouldOpenDrawer = false;
     switch(routeString){
       case "station":
         shouldOpenDrawer = true;
         return;
     }
  })

  function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

  const getAir = async coords => {
    window.worker.postMessage({ action: "FETCH_AIR", payload: coords });
  };

  onMount(() => {
    window.navigator.geolocation.getCurrentPosition(onSuccess, err => {
      console.log(err);
    });
  });

  const onSuccess = ({ coords }) => {
    coordinates = coords;
    //[_ne.lat, _ne.lng, _sw.lat, _sw.lng]
    window.worker.postMessage({ action: "FETCH_AIR", payload: {
      _ne:{
        lat:90,
        lng:180
      },
      _sw:{
        lat:-90,
        lng:-180,
      }
    } });
      firstDataFetched = true;
  };

  const handleMapChange = async ev => {
    if(firstDataFetched) return;
    const d = await fetchStations(ev.detail.bounds);
    
  };

 

  let selectedStation;
  const unsubscribeStation = station.subscribe(value => {
    selectedStation = value;  
  });
</script>

<style>
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .drawer-header {
    display: flex;
  }
</style>

<AppHeader />
<Drawer class="drawer" variant="modal" open={shouldOpenDrawer}>
  <Router>
    <Route let:params path="station/:id">
      <StationDetails id={params.id}/>
    </Route>
  </Router>
</Drawer>
<Scrim />
<AppContent>
  <Map
    coords={coordinates}
    width="100%"
    height="calc(100vh - 64px)"
    {zoom}
    features={{ type: 'FeatureCollection', features: [...data] }}
    on:mapChange={debounce((ev)=>handleMapChange(ev),750)}
    />
</AppContent>
