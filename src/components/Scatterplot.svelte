<script>
    import { scaleLinear } from 'd3-scale';
    import { extent } from 'd3-array';
    import Flower from './Flower.svelte'
  
    export let datapoints = [];
    export let x;
    export let y;
  
    export let selected_datapoint = undefined;
  
    $: xScale = scaleLinear().domain(extent(datapoints.map((d) => { return d[x]}))).range([0,400])
    $: yScale = scaleLinear().domain(extent(datapoints.map((d) => { return d[y]}))).range([0,400])
  
    let mouse_x, mouse_y;
    const setMousePosition = function(event) {
      mouse_x = event.clientX;
      mouse_y = event.clientY;
    }
  </script>
  
  <style>
    svg {
      background-color: whitesmoke;
      margin: 5px;
      padding: 20px;
    }
    circle {
      fill: steelblue;
      fill-opacity: 0.3;
    }
    circle.selected {
      fill: red;
      fill-opacity: 1;
    }
    #tooltip {
      position: fixed;
      background-color: white;
      padding: 3px;
      border: solid 1px;
    }
    svg.tooltip {
      margin: 0px;
      padding: 0px;
    }
  </style>
  
  <p>{x} by {y}</p>
  <svg width=400 height=400>
    {#each datapoints as datapoint}
      <circle cx={xScale(datapoint[x])} cy={yScale(datapoint[y])}
              r=5
              class:selected="{selected_datapoint && datapoint.id == selected_datapoint.id}"
              on:mouseover={function(event) {selected_datapoint = datapoint; setMousePosition(event)}}
              on:mouseout={function() {selected_datapoint = undefined}}/>
    {/each}
  </svg>
  
  {#if selected_datapoint != undefined}
  <div id="tooltip" style="left: {mouse_x + 10}px; top: {mouse_y - 10}px">
  <svg class="tooltip" width=20 height=20>
    <g transform="translate(10,10)">
    <Flower datapoint={selected_datapoint} />
    </g>
  </svg><br/>
  Species: {selected_datapoint.species}
  </div>
  {/if}