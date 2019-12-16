let coords
self.addEventListener('message', async function(e) {
    switch(e.data.action){
        case 'FETCH_AIR':
            coords = e.data.payload;
            const data = await fetchAir(coords);
            self.postMessage({action:"ON_AIR_FETCHED",payload:data});
            setInterval(() => {
                const data = await fetchAir(coords);
                self.postMessage({action:"ON_AIR_FETCHED",payload:data});
            }, 60*1000);
        case 'FETCH_STATION_DETAILS':
            const payload = await fetchStationDetails(e.data.payload)
            self.postMessage({action:"ON_STATION_DETAILS_FETCHED",payload})
    }    
})


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
   
    const d  = await res.json();

   const data = [...d.data].filter(item => !isNaN(parseInt(item.aqi))).map(item => ({
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

      return data;
}