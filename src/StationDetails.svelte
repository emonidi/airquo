<script>
  import { Header, Title, Content } from "@smui/drawer";
  import IconButton from "@smui/icon-button";
  import { onMount, onDestroy } from "svelte";
  import { station } from "./stores/LocationStore";
  import {
    getSelectedStationDetails,
    selectedStation
  } from "./stores/StationsStore";
  import { aqiIcon } from "./iconMap";
  import { navigate } from "svelte-routing";
  import List, { Item, Text } from "@smui/list";
  import Paper, { Content as PaperContent } from "@smui/paper";
  import Card, { Content as CardContent, Title as CardTitle } from "@smui/card";
  import { currentRoute } from "./stores/UIStore";

  export let id;
  let selected;
  let stationData;
  let values = [];

  onMount(() => {
    currentRoute.set("station");
    getSelectedStationDetails(id);
  });
  onDestroy(() => {
    currentRoute.set(null);
    selectedStation.set(null);
    unsubscribeStation();
  });

  const unsubscribeStation = selectedStation.subscribe(value => {
    if (value) {
      console.log(value);
      selected = { ...value };
    } else {
      selected = value;
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
  <Title>{selected ? selected.city.name : ''}</Title>
  <IconButton
    ripple={false}
    on:click={() => {
      station.set(null);
      navigate('/');
    }}
    align="end"
    class="material-icons"
    id="close-drawer-button">
    close
  </IconButton>
</Header>
<Content>
  {#if selected}
    <Card>
      <CardContent>
        <div class="paper-container">
          <Paper
            style="background-color:{selected && getColorFromValue(parseInt(selected.aqi))}">
            <PaperContent align="center">
              {#if selected && selected.aqi}
                <div class="aqi-indication">
                  <img
                    style="width:50px;height:50px"
                    src={aqiIcon(selected.aqi)} />
                  <h1 class="value">{selected && selected.aqi}</h1>
                </div>
              {/if}

            </PaperContent>
          </Paper>
        </div>
        <List>
          {#if selected}
            {#each selected.iaqi as value}
              <Item>
                <Text>{`${value.key}: ${value.value}`}</Text>
              </Item>
            {/each}
          {/if}
        </List>
      </CardContent>
    </Card>
  {/if}
</Content>
