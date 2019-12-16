<script>
  import { Header, Title, Content } from "@smui/drawer";
  import IconButton from "@smui/icon-button";
  import { station } from "./LocationStore";
  import List ,{Item,Text} from "@smui/list";
  import Paper, {Content as PaperContent} from "@smui/paper";
  import Card, { Content as CardContent, Title as CardTitle } from "@smui/card";
  let selectedStation;
  let stationData;
  let values = []

  const getSelectedStationDetails = async stationId => {
    window.worker.postMessage({action:'FETCH_STATION_DETAILS',payload:stationId})
  };

  window.worker.addEventListener('message',({data})=>{
    const {action,payload} = data;
    if(action === "ON_STATION_DETAILS_FETCHED"){
      debugger
      values = payload;
    }
  })

  const unsubscribeStation = station.subscribe(value => {
    if (value) {
      selectedStation = { ...value, station: JSON.parse(value.station) };
      getSelectedStationDetails(selectedStation.uid);
    } else {
      selectedStation = value;
      stationData = null;
      values = [];
    }
  });


  const getColorFromValue = value => {
    if (value < 51) {
      return "#009966";
    }

    if (value >= 51 && value <= 100) {
      return "#ffde33";
    }

    if (value >= 101 && value <= 150) {
      return "#ff9933";
    }

    if (value >= 151 && value <= 200) {
      return "#cc0033";
    }

    if (value >= 201 && value <= 300) {
      return "#660099";
    }

    if(value >= 300){
      return "#7e0023"
    }
     return "black"
  };
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
  <Card>
    <CardContent>
      <div>Air quality is</div>
      <div class="paper-container">
        <Paper
          style="background-color:{selectedStation && getColorFromValue(parseInt(selectedStation.aqi))}" >
          <PaperContent align="center">
            <h1 class="value">{selectedStation && selectedStation.aqi}</h1>
          </PaperContent>
        </Paper>
      </div>
      <List>
      {#each values as value}
        <Item>
          <Text>{`${value.key}: ${value.value}`}</Text>
        </Item>
      {/each}
      </List>
    </CardContent>
  </Card>
</Content>

<style>
  .value{
    color:#fff;
    font-size: 22;
    padding:10px;
    margin:0;
  }
</style>
