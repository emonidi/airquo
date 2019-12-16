<script>
  import { Header, Title, Content } from "@smui/drawer";
  import IconButton from "@smui/icon-button";
  import { station } from "./LocationStore";
  import List, { Item, Text } from "@smui/list";
  import Paper, { Content as PaperContent } from "@smui/paper";
  import Card, { Content as CardContent, Title as CardTitle } from "@smui/card";
  let selectedStation;
  let stationData;
  let values = [];

  const getSelectedStationDetails = async station => {
    window.worker.postMessage({
      action: "FETCH_STATION_DETAILS",
      payload: station
    });
  };

  window.worker.addEventListener("message", ({ data }) => {
    if (data.action === "ON_STATION_DETAILS_FETCHED") {
      station.set({ ...data.payload });
    }
  });

  const unsubscribeStation = station.subscribe(value => {
    if (value) {
      selectedStation = {
        ...value,
        station:
          typeof value.station === "string"
            ? JSON.parse(value.station)
            : value.station
      };
      if (!selectedStation.station.name) {
        getSelectedStationDetails(selectedStation);
      }
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

    if (value >= 300) {
      return "#7e0023";
    }
    return "black";
  };
</script>

<style>
  .value {
    color: #fff;
    font-size: 22;
    padding: 10px;
    margin: 0;
  }
</style>

<Header class="drawer-header">
  <Title>
    {selectedStation && selectedStation.station && selectedStation.station.name}
  </Title>
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
          style="background-color:{selectedStation && getColorFromValue(parseInt(selectedStation.aqi))}">
          <PaperContent align="center">
            <h1 class="value">{selectedStation && selectedStation.aqi}</h1>
          </PaperContent>
        </Paper>
      </div>
      <List>
        <!-- {#each values as value}
        <Item>
          <Text>{`${value.key}: ${value.value}`}</Text>
        </Item>
      {/each} -->
      </List>
    </CardContent>
  </Card>
</Content>
