import {writable} from 'svelte/store';

export const stations = writable([]);
export const selectedStation = writable(null);
export const sortedStations = writable([])
export const fetchStations = (coords) =>{
    window.worker.postMessage({ action: "FETCH_AIR", payload: coords });
}

window.addEventListener('load',()=>{
    window.worker.addEventListener("message", function({data}) {
        const { action, payload } = data;
        switch(action){
            case "ON_AIR_FETCHED":
                stations.set(payload);
                return;
            case "ON_STATION_DETAILS_FETCHED":
                selectedStation.set(payload)
                return;
            case "SORTED_STATIONS":
                sortedStations.set(payload)
        }
        
      });
})

export const getSelectedStationDetails = async stationId => {
    
    window.worker.postMessage({
      action: "FETCH_STATION_DETAILS",
      payload: stationId
    });
  };


