<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import { currentRoute } from "./stores/UIStore";
  import {navigate} from 'svelte-routing';

  let currRoute;

  const subscribeCurrentRoute = currentRoute.subscribe(cr => {
    currRoute = cr;
  });

</script>

<TopAppBar variant="static" secondary="true">
  <Row>
    <Section>
      {#if currRoute == 'home'}
        <IconButton class="material-icons menu-button">menu</IconButton>
      {:else}
        <IconButton on:click={()=>{
          currentRoute.set('home')
          navigate('/')
        }} class="material-icons menu-button">arrow_back</IconButton>
      {/if}
      <Title>AirQuo</Title>
    </Section>
  </Row>
</TopAppBar>
