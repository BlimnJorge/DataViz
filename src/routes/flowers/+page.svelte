<script>
  import Flower from '../../components/Flower.svelte';
  import Scatterplot from '../../components/Scatterplot.svelte'
  export let data;
  let slider_value = 20;
  $: get_xy = function(idx) {
      let y = 25 + (Math.floor(idx / slider_value) * 50)
      let x = 25 + ((idx % slider_value) * 50)
      return [x,y]
  }
</script>

<p>Back <a href="/">home</a></p>

<style>
  circle {
      fill: steelblue;
      fill-opacity: 0.5;
  }
</style>

<h2>Flower scatterplot with tooltip</h2>

<Scatterplot datapoints={data.flowers} x="sepalLength" y="sepalWidth"/>

<h2>Click on one of the flowers below to open the slug.</h2>

Number of flowers per line: {slider_value}<br/>
<input type="range" min="10" max="20" bind:value={slider_value} /><br/>
<svg width=1000 height=1000>
  {#each data.flowers as datapoint,idx}
      <g transform="translate({get_xy(idx)[0]}, {get_xy(idx)[1]})">
          <a href="/flowers/{datapoint.id}"><Flower datapoint={datapoint} /></a>
      </g>
  {/each}
</svg>