<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    let intervals1 = [
      { start: 0, end: 0.98, color: "#e63946" },
      { start: 1.0, end: 2.07, color: "#457b9d" },
      { start: 2.54, end: 3.0, color: "#2a9d8f" }
    ];
  
    let intervals2 = [
      { start: 0, end: 1.04, color: "#e63946" },
      { start: 1.0, end: 2.096, color: "#457b9d" },
      { start: 2.65, end: 3.0, color: "#2a9d8f" }
    ];
  
    onMount(() => {
      drawTimelines(intervals1, intervals2);
    });
  
    function drawTimelines(data1, data2) {
      const margin = { top: 20, right: 30, bottom: 70, left: 60 };
      const width = 600 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;
  
      const svg = d3.select('#timeline-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      const xScale = d3.scaleLinear()
        .domain([0, 4]) // adjust domain based on your data
        .range([0, width]);
  
      const yScale = d3.scaleBand()
        .domain(['Material 1', 'Material 2']) // two timelines
        .range([0, height])
        .padding(0.1);
  
      // Draw light background for entire interval
      svg.append('rect')
        .attr('x', xScale(0))
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#f0f0f0');
  
      svg.selectAll('.bar1')
        .data(data1)
        .enter()
        .append('rect')
        .attr('class', 'bar1')
        .attr('x', d => xScale(d.start))
        .attr('y', 0)
        .attr('width', d => xScale(d.end) - xScale(d.start))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => d.color);
  
      svg.selectAll('.bar2')
        .data(data2)
        .enter()
        .append('rect')
        .attr('class', 'bar2')
        .attr('x', d => xScale(d.start))
        .attr('y', yScale('Material 2'))
        .attr('width', d => xScale(d.end) - xScale(d.start))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => d.color);
  
      // X Axis
      const xAxis = d3.axisBottom(xScale)
        .tickValues([0, 1, 2, 3, 4]) // adjust tick values based on your data
        .tickFormat(d => `${d} days`);
  
      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
  
      // Y Axis
      const yAxis = d3.axisLeft(yScale);
  
      svg.append('g')
        .call(yAxis);
  
        // Title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Average Timeline per Material');
  
  
      // Legend
      const legend = svg.append('g')
        .attr('transform', `translate(${width - 50}, ${height + margin.bottom })`);
  
      legend.selectAll('.legend-item')
        .data([
          { color: "#e63946", label: "Planned - Actual Shipment" },
          { color: "#457b9d", label: "Planned - Actual Arrival" },
          { color: "#2a9d8f", label: "Actua - Planned Receipt" }
        ])
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
          g.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => d.color);
  
          g.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('dy', '0.5em')
            .text(d => d.label);
        });
    }
  </script>
  
  <div id="timeline-container"></div>
  
  <style>
    rect {
      stroke: #fff;
    }
  </style>
  
  
  <div class="legend">
    <div><span style="background-color: #e63946; width: 20px; height: 20px; display: inline-block;"></span> Planned - Actual Shipment</div>
    <div><span style="background-color: #457b9d; width: 20px; height: 20px; display: inline-block;"></span> Planned - Actual Arrival at Yard</div>
    <div><span style="background-color: #2a9d8f; width: 20px; height: 20px; display: inline-block;"></span> Actual - Planned Goods Receipt</div>
  </div>    