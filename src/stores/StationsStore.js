import {writable} from 'svelte/store';

export const stations = writable([]);
export const selectedStation = writable(null);
export const fetchStations = (coords) =>{
    window.worker.postMessage({ action: "FETCH_AIR", payload: coords });
}

window.addEventListener('load',()=>{
    window.worker.addEventListener("message", function(e) {
        if (e.data.action === "ON_AIR_FETCHED") {
            stations.set([...e.data.payload]);
        }
      });

      window.worker.addEventListener("message", ({ data }) => {
        const { action, payload } = data;
        console.log(data)
        if (action === "ON_STATION_DETAILS_FETCHED") {
            selectedStation.set(payload)
        }
      });
})

export const getSelectedStationDetails = async stationId => {
    
    window.worker.postMessage({
      action: "FETCH_STATION_DETAILS",
      payload: stationId
    });
  };


