var coords;
self.addEventListener('message', async function(e) {
    switch(e.data.action){
        case 'FETCH_AIR':
            coords = e.data.payload;
            const data = await fetchAir(e.data.payload);
            self.postMessage({action:"ON_AIR_FETCHED",payload:data});
            const separated = separateByAqiRange(data);
            self.postMessage({action:"SORTED_STATIONS",payload:separated});
            setInterval(async () => {
                const data = await fetchAir(coords);
                self.postMessage({action:"ON_AIR_FETCHED",payload:data});
                const separated = separateByAqiRange(data);
                self.postMessage({action:"SORTED_STATIONS",payload:separated});
            }, 60000);
            return;
        case 'FETCH_STATION_DETAILS':
            const payload = await fetchStationDetails(e.data.payload)
            self.postMessage({action:"ON_STATION_DETAILS_FETCHED",payload})
            return;
    }    
})

const separateByAqiRange = (values)=>{
  let intervals = [
    [], // 0 - 50
    [], // 51 - 100
    [], // 101 - 150
    [], // 151 - 200
    [], // 200 - 300
    [], // 300+
  ]

  const cols =  ["#009966","#ffde33","#ff9933","#cc0033", "#660099","#7e0023"];

  values.forEach((item,i)=>{
    const aqi = item.properties.aqi;
    if(i === 0){
      
    }
    if(aqi >= 0 && aqi <= 50 ){
      intervals[0].push(item);
    }

    if(aqi >= 51 && aqi <= 100 ){
      intervals[1].push(item);
    }

    if(aqi >= 101 && aqi <= 150 ){
      intervals[2].push(item);
    }
    
    if(aqi >= 151 && aqi <= 200 ){
      intervals[3].push(item);
    }

    if(aqi >= 200 && aqi <= 300 ){
      intervals[4].push(item);
    }

    if(aqi > 300 ){
      intervals[5].push(item);
    }
  
  })

 intervals = intervals.map((int,i)=>{
    return {
      type: 'FeatureCollection',
      features:int,
      color:cols[i]
    }
  })

  return intervals;
    
}

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
    // const res = await fetch(
    //     `https://api.waqi.info/feed/@${stationId}/?token=c472110c54ce8941e8a361c36bdbd21613f9ab69`
    //   );
    const res = await fetch(`https://evening-caverns-26602.herokuapp.com/station/${stationId}`)
      stationData = await res.json();
      return {...stationData, iaqi:[]}
      // if(stationData.status !== 'error'){
      //   return {
      //     ...stationData.data, 
      //     iaqi:Object.keys(stationData.data.iaqi).map((k)=>{
      //       return {
      //         key:k.toUpperCase(),
      //         value:parseFloat(stationData.data.iaqi[k].v).toFixed(2)
      //       }
      //     })
      //   } 
      // }else{
      //     return [];
      // }
}

async function fetchAir(coords){
    const { _sw, _ne } = coords;
    const bounds = [_ne.lat, _ne.lng, _sw.lat, _sw.lng];
    const res = await fetch('https://evening-caverns-26602.herokuapp.com/')
    // const res = await fetch('http://localhost:3000')

    let d  = await res.json();
    d = d.data;
    const data = [...d]
    .filter(item => !isNaN(parseInt(item.aqi)))
    .map(item => ({
        type: "Feature",
        properties: {
          aqi: parseInt(item.aqi),
          uid: item.uid,
          station:item.station
        },
        geometry: {
          type: "Point",
          coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
        }
      }));

      return data;
}