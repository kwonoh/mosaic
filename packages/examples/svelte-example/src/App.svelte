<script>
  import { coordinator, DuckDBWASMConnector } from "@uwdata/mosaic-core";
  import MainView from "./lib/MainView.svelte";
  import { loadCSV } from "@uwdata/mosaic-sql";

  async function init() {
    const wasm = new DuckDBWASMConnector();
    coordinator().databaseConnector(wasm);

    await coordinator().exec(
      loadCSV("weather", `${window.location}seattle-weather.csv`)
    );
  }
</script>

{#await init()}
  Initializing...
{:then}
  <MainView />
{/await}
