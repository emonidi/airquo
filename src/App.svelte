<script>
  import { onMount } from "svelte";
  import AppHeader from "./Header.svelte";
  import Map from "./Map.svelte";
  import Marker from "./Marker.svelte";
  import { stationId, station } from "./LocationStore";
  import StationDetails from "./StationDetails.svelte";

  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim
  } from "@smui/drawer";

  import IconButton from "@smui/icon-button";

  window.worker.addEventListener("message", function(e) {
    if (e.data.action === "ON_AIR_FETCHED") {
      data = e.data.payload;
    }
  });
  let firstDataFetched = false;
  let data = [];
  let coordinates;
  let zoom = 2;

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
    // window.worker.postMessage({ action: "FETCH_AIR", payload: {
    //   _ne:{
    //     lat:-90.000,
    //     lng:-180.000
    //   },
    //   _sw:{
    //     lat:90.000,
    //     lng:180.000,
    //   }
    // } });
  };

  const handleMapChange = async ev => {
    if(firstDataFetched) return;
    const d = await getAir(ev.detail.bounds);
    firstDataFetched = true;
  };

  const handleStationClicked = ev => {
    station.set({ ...ev.detail[0].properties });
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
<Drawer class="drawer" variant="modal" open={selectedStation !== null}>
  <StationDetails />
</Drawer>
<Scrim />
<AppContent>
  <Map
    coords={coordinates}
    width="100%"
    height="calc(100vh - 64px)"
    {zoom}
    features={{ type: 'FeatureCollection', features: [...data] }}
    on:mapChange={handleMapChange}
    on:stationClicked={handleStationClicked} />
</AppContent>
<!-- <Header>
</Header>
<main>
  <div id="map-container">
  <Map
    coords={coordinates}
    width="100%"
    height="100vh"
    {zoom}
	features={{
	"type" : "FeatureCollection",
	"features" : [...data]
}}
    on:mapChange={handleMapChange} /></div>
</main> -->
