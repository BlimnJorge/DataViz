<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
  
    import Vendor1 from '../../components/Vendor1.svelte';
    import Vendor2 from '../../components/Vendor2.svelte';
    import Vendor3 from '../../components/Vendor3.svelte';
  
    let units = "Widgets";
    let margin = { top: 10, right: 10, bottom: 10, left: 10 };
    let width = 960 - margin.left - margin.right;
    let height = 600 - margin.top - margin.bottom;
    let graph = {
      "nodes": [
        {"name":"vendor1001"},
        {"name":"vendor1002"},
        {"name":"vendor1003"},
        {"name":"plant4"},
        {"name":"plant5"},
        {"name":"plant6"},
        {"name":"plant7"},
        {"name":"plant8"},
        {"name":"destination1"},
        {"name":"destination2"},
        {"name":"destination3"},
        {"name":"destination4"},
        {"name":"destination5"}
      ],
      "links":[
        {"source":0,"target":3,"value":6855, "delay": 0},
        {"source":0,"target":3,"value":1416, "delay": 1},
        {"source":0,"target":6,"value":93, "delay": 0},
        {"source":0,"target":6,"value":14, "delay": 1},
        {"source":1,"target":4,"value":3037, "delay": 0},
        {"source":1,"target":4,"value":591, "delay": 1},
        {"source":1,"target":7,"value":2940, "delay": 0},
        {"source":1,"target":7,"value":615, "delay": 1},
        {"source":2,"target":5,"value":3679, "delay": 0},
        {"source":2,"target":5,"value":760, "delay": 1},
        {"source":3,"target":8,"value":8269, "delay": 0},
        {"source":4,"target":9,"value":3628, "delay": 0},
        {"source":5,"target":10,"value":4439, "delay": 0},
        {"source":6,"target":11,"value":107, "delay": 0},
        {"source":7,"target":12,"value":3555, "delay": 0}
      ]
    };
  
    let currentComponent = null; 
    let mouseX = 0;
    let mouseY = 0;
  
    onMount(() => {
      // 
      graph.links.forEach((link, index) => {
        if (typeof link.delay === 'undefined') {
          console.warn(`Link at index ${index} is missing delay property, setting default value to 0`);
          link.delay = 0; 
        } else if (link.delay !== 0 && link.delay !== 1) {
          console.warn(`Link at index ${index} has unexpected delay value: ${link.delay}, setting default value to 0`);
          link.delay = 0; 
        }
        console.log(`Link from ${link.source} to ${link.target} has delay: ${link.delay}`);
      });
  
      //
      graph.links.forEach((link, index) => {
        console.log(`After check, link from ${link.source} to ${link.target} has delay: ${link.delay}`);
      });
  
      initSankey();
    });
  
    function initSankey() {
      const formatNumber = d3.format(",.0f"),
        format = (d) => formatNumber(d) + " " + units,
        color = d3.scaleOrdinal(d3.schemeCategory10);
  
      const svg = d3.select("#sankey").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      const sankey = d3Sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .extent([[1, 1], [width - 1, height - 6]]);
  
      sankey(graph);
  
      const link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", sankeyLinkHorizontal())
        .style("stroke-width", (d) => Math.max(1, d.width))
        .style("stroke", (d) => {
          console.log(`Setting color for link from ${d.source.name} to ${d.target.name} with delay ${d.delay}`);
          if (d.delay === 1) {
            return "rgba(255, 99, 71, 0.3)";
          } else if (d.delay === 0) {
            return "rgba(70, 130, 180, 0.3)";
          } else {
            console.error(`Unexpected delay value for link from ${d.source.name} to ${d.target.name}: ${d.delay}`);
            return "rgba(0, 0, 0, 0.3)"; 
          }
        })
        .append("title")
        .text((d) => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);
  
      const node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
  
      node.append("rect")
        .attr("height", (d) => d.y1 - d.y0)
        .attr("width", sankey.nodeWidth())
        .style("fill", (d) => d.color = color(d.name.replace(/ .*/, "")))
        .style("stroke", (d) => d3.rgb(d.color).darker(2))
        .append("title")
        .text((d) => `${d.name}\n${format(d.value)}`);
  
      node.append("text")
        .attr("x", -6)
        .attr("y", (d) => (d.y1 - d.y0) / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text((d) => d.name)
        .filter((d) => d.x0 < width / 2)
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");
  
      node.on("mouseover", function(event, d) {
        switch (d.name) {
          case "vendor1001":
            currentComponent = Vendor1;
            break;
          case "vendor1002":
            currentComponent = Vendor2;
            break;
          case "vendor1003":
            currentComponent = Vendor3;
            break;
        }
      }).on("mousemove", function(event) {
        mouseX = event.pageX;
        mouseY = event.pageY;
      }).on("mouseout", function() {
        currentComponent = null;
      });
    }
  </script>
  
  <style>
    #sankey {
      width: 100%;
      height: 600px;
      margin: auto;
    }
  
    .link {
      fill: none;
      stroke: #000;
      stroke-opacity: 0.2;
    }
  
    .link:hover {
      stroke-opacity: 0.5;
    }
  
    .node rect {
      fill-opacity: .9;
      shape-rendering: crispEdges;
    }
  
    .node text {
      fill: #000;
      font: 10px sans-serif;
    }
  
    #popup-image {
      display: none; 
      position: absolute;
      top: 100px;
      left: 100px;
      width: 200px;
      z-index: 1000; 
    }
  
    @media (max-width: 600px) {
      #popup-image {
          top: 50px;  
          left: 10px; 
          width: 150px; 
      }
    }
  
    .tooltip {
      position: absolute;
      pointer-events: none;
      z-index: 1000;
      background-color: white; 
      border: 1px solid #ccc; 
      padding: 10px; 
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); 
    }
  </style>
  
  <h1>Vendor Delays to Plant Sankey Diagram</h1>
  <div id="sankey"></div>
  <div id="visualization"></div>
  <div id="annotations">
    <p>Blue represents DelayDays &le; 0 (shippment on time), Red represents DelayDays &gt; 0 (shippment delay).</p>
    <p>Vendor 1001's shipment destinations are plants 4 and 7. Plant 4's count of early arrivals is 6855, and the count of delayed arrivals is 1416; plant 7's count of early arrivals is 93, and the count of delayed arrivals is 14.</p>
    <p>The shipment destinations for vendor 1002 are plants 5 and 8. Plant 5's count of early arrivals is 3037, and the count of delayed arrivals is 591; plant 8's count of early arrivals is 2940, and the count of delayed arrivals is 615.</p>
    <p>The shipment destination for vendor 1003 is plant 6. The count of early arrivals for plant 6 is 3679, and the count of delayed arrivals is 760.</p>
  </div>
  
  {#if currentComponent}
    <div class="tooltip" style="top: {mouseY + 10}px; left: {mouseX + 10}px;">
      <svelte:component this={currentComponent} />
    </div>
  {/if}
  