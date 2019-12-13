<script>
  import { onMount } from "svelte";
  import AppHeader from "./Header.svelte";
  import Map from "./Map.svelte";
  import Marker from "./Marker.svelte";
  import { stationId, station } from "./LocationStore";
  import  StationDetails from './StationDetails.svelte';

  import Drawer, {
    AppContent,
    Content,
    Header,
    Title,
    Subtitle,
    Scrim
  } from "@smui/drawer";

  import IconButton from "@smui/icon-button";

  let data = [];
  let coordinates;
  let zoom = 8;

  const getAir = async coords => {
    const { _sw, _ne } = coords;
    const bounds = [_ne.lat, _ne.lng, _sw.lat, _sw.lng];
    const res = await fetch(
      `https://api.waqi.info/map/bounds/?token=c472110c54ce8941e8a361c36bdbd21613f9ab69&latlng=${bounds.join(
        ","
      )}`
    );
    return await res.json();
  };

  onMount(() => {
    window.navigator.geolocation.getCurrentPosition(onSuccess);
  });

  const onSuccess = ({ coords }) => {
    coordinates = coords;
  };

  const handleMapChange = async ev => {
    const d = await getAir(ev.detail.bounds);
    data = [...d.data].map(item => ({
      type: "Feature",
      properties: {
        aqi: parseInt(item.aqi),
		uid: item.uid,
		station:item.station
      },
      geometry: {
        type: "Point",
        coordinates: [item.lon, item.lat]
      }
    }));
  };

  const handleStationClicked = ev => {
    station.set({...ev.detail[0].properties});
  };
  let selectedStation;
  const unsubscribeStation = station.subscribe(value => {
	selectedStation = value ? {...value, station:JSON.parse(value.station)} : null;
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
<Drawer variant="modal" open={selectedStation !== null}>
	<StationDetails></StationDetails>
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
