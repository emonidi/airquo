<script>
  import { Header, Title, Content } from "@smui/drawer";
  import IconButton from "@smui/icon-button";
  import { station } from "./LocationStore";
  import Card, {Content as CardContent} from '@smui/card';

  const getSelectedStationDetails = async (stationId) => {
      const res = await fetch(`https://api.waqi.info/feed/@${stationId}/?token=c472110c54ce8941e8a361c36bdbd21613f9ab69`);
      selectedStation = {...selectedStation, ... await res.json().data};
  }

  let selectedStation;
  const unsubscribeStation = station.subscribe(value => {
     if(value){
         selectedStation = { ...value, station: JSON.parse(value.station) };
         getSelectedStationDetails(selectedStation.uid)
     }else{
         selectedStation = value;
     }
  });
</script>

<Header class="drawer-header">
  <Title>{selectedStation && selectedStation.station.name}</Title>
  <IconButton
    ripple={false}
    on:click={() => {
      station.set(null);
    }}
    align="end"
    class="material-icons"
    id="close-drawer-button">
    close
  </IconButton>
</Header>
<Content>
    <Card></Card>
</Content>

