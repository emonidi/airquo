let coords
self.addEventListener('message', async function(e) {
    switch(e.data.action){
        case 'FETCH_AIR':
            coords = e.data.payload;
            const data = await fetchAir(e.data.payload);
            self.postMessage({action:"ON_AIR_FETCHED",payload:data});
            setInterval(async () => {
                const data = await fetchAir(coords);
                self.postMessage({action:"ON_AIR_FETCHED",payload:data});
            }, 60000);
            return;
        case 'FETCH_STATION_DETAILS':
            const payload = await reverseGeocode(e.data.payload.station.location)
            self.postMessage({action:"ON_STATION_DETAILS_FETCHED",payload:{...e.data.payload,station:{...e.data.payload.station,name:payload}}})
            return;
    }    
})



const reverseGeocode = async(stationLocation) =>{
  const [lng,lat] = stationLocation;
  const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoiZW1vbmlkaSIsImEiOiJjazQ4YjBwZHUwNGNhM2Vwajl6amh5ZXF6In0.Ff0q8Iespva3vERpi8Fo9w`)
  const data = await res.json();
  return data.features[0].place_name
} 

const fetchStations = async() => {
  const res = await fetch(`https://maps.luftdaten.info/local-labs/labs.json`);
  const stations = await res.json();
}

const fetchStationDetails =  async stationId => {
    const res = await fetch(
        `https://api.waqi.info/feed/@${stationId}/?token=c472110c54ce8941e8a361c36bdbd21613f9ab69`
      );
      stationData = await res.json();
      if(stationData.status !== 'error'){
        return Object.keys(stationData.data.iaqi).map((k)=>{
            return {
              key:k.toUpperCase(),
              value:parseFloat(stationData.data.iaqi[k].v).toFixed(2)
            }
          });
      }else{
          return [];
      }
}

async function fetchAir(coords){
    const { _sw, _ne } = coords;
    const bounds = [_ne.lat, _ne.lng, _sw.lat, _sw.lng];
    const res = await fetch(
      `https://api.waqi.info/map/bounds/?token=c472110c54ce8941e8a361c36bdbd21613f9ab69&latlng=${bounds.join(
        ","
      )}`
    );
    // const res = await fetch(`https://maps.luftdaten.info/data/v2/data.dust.min.json`)
   
    let d  = await res.json();
    d = d.data;
    const data = [...d]
    .filter(item => !isNaN(parseInt(item.aqi)))
    .map(item => ({
        type: "Feature",
        properties: {
          aqi: parseInt(item.aqi),
          uid: item.id,
          station:item.station
        },
        geometry: {
          type: "Point",
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
        }
      }));

      return data;
}