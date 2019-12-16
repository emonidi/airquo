<script>
  import { onMount, afterUpdate, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let coords;
  export let width;
  export let height;
  export let zoom;
  export let features;

  let map;

  mapboxgl.accessToken =
    "pk.eyJ1IjoiZW1vbmlkaSIsImEiOiJjajdqd3pvOHYwaThqMzJxbjYyam1lanI4In0.V_4P8bJqzHxM2W9APpkf1w";

  afterUpdate(props => {
    if (!map && coords) {
      map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/mapbox/dark-v10", //hosted style id
        center: [coords.longitude, coords.latitude], // starting position
        zoom: zoom // starting zoom
      });

      map.on("load", ev => {
        map.addSource("air", {
          type: "geojson",
          data: features,
          cluster: false,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });
        
        map.addLayer({
          minzoom: 0,
          id: "source",
          source: "air",
          data: features,
          type: "circle",
          paint: {
            "circle-opacity": {
              stops: [[0, 0.01], [10, 1]]
            },
            "circle-color": {
              property: "aqi",
              type: "interval",
              stops: [
                [0, "#009966"],
                [50, "#ffde33"],
                [100, "#ff9933"],
                [150, "#cc0033"],
                [200, "#660099"],
                [300, "#7e0023"]
              ]
            },

            "circle-radius": 8
          }
        });
        dispatchMapChange(ev);
      });

      map.on("zoomend", dispatchMapChange);
      map.on("dragend", dispatchMapChange);
      map.on("click", "source", ev => {
        dispatch("stationClicked", { ...ev.features });
      });
    }

    if (map && map.getSource("air")) {
      
    }
  });

  function dispatchMapChange(ev) {
    dispatch("mapChange", {
      bounds: ev.target.getBounds()
    });
  }
</script>

<style>
  #map {
    width: 100%;
  }
</style>

<div id="map" style={`width:${width};height:${height}`} />
<slot />
