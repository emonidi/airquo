<script>
  import { onMount, afterUpdate, createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";
  import { sortedStations } from "./stores/StationsStore";
  const dispatch = createEventDispatcher();

  export let coords;
  export let width;
  export let height;
  export let zoom;
  export let features;
  let unsubscribeFromSeparated;
  let map;

  mapboxgl.accessToken =
    "pk.eyJ1IjoiZW1vbmlkaSIsImEiOiJjajdqd3pvOHYwaThqMzJxbjYyam1lanI4In0.V_4P8bJqzHxM2W9APpkf1w";

  afterUpdate(props => {
    if (!map && coords) {
      map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/mapbox/dark-v10?optimize=true", //hosted style id
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
          minzoom: 7,
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
        // dispatch("stationClicked", { ...ev.features });
        if (ev.features && ev.features[0].properties.uid) {
          navigate(`/station/${ev.features[0].properties.uid}`);
        }
      });
    }

    if (map && map.getSource("air")) {
      map.getSource("air").setData(features);
    }
    if (map && !unsubscribeFromSeparated) {
      unsubscribeFromSeparated = sortedStations.subscribe(ld => {
        ld.forEach((el, i) => {
          if (!map.getSource(`heat-map-${i}`)) {
            map.addSource(`heat-map-${i}`, {
              type: "geojson",
              data: el
            });

            map.addLayer(
              {
                id: `aqi-heat-${i}`,
                type: "heatmap",
                source: `heat-map-${i}`,
                maxzoom: 7,
                paint: {
                  // increase weight as diameter breast height increases
                  "heatmap-weight": {
                    property: "aqi",
                    type: "exponential",
                    stops: [[1, 0], [62, 1]]
                  },
                  // increase intensity as zoom level increases
                  "heatmap-intensity": {
                    stops: [[0, 0], [10, 5]]
                  },
                  // assign color values be applied to points depending on their density
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "transparent",
                    1,
                    el.color
                  ],
                  // increase radius as zoom increases
                  "heatmap-radius": {
                    stops: [[0, 10], [15, 75]]
                  },
                  // decrease opacity to transition into the circle layer
                  "heatmap-opacity": {
                    default: 1,
                    stops: [[0, 0.1], [15, 1]]
                  }
                }
              },
              "waterway-label"
            );
          }else{
            map.getSource(`heat-map-${i}`).setData(el)
          }
        });
      });
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
