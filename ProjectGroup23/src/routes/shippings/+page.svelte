<script>
	import {onMount} from 'svelte';
	import * as d3 from 'd3';

  let element;
  let delaySliderMax = 14;
  let delaySliderMin = 1
  let dateSlidermax = 100
  let dateSlidermin = 0
  let dateRange = [new Date("2022-01-01"), new Date("2024-12-31")]; // Set date range
  let plantKeyInfo
  let barchartelem
  let filteredData
  let uniqueCountries
  let selectedCountry
  let processedData
  let selectedPlantKey = null; // Variable to store the selected plant key


  export let data = []

  //Processing Methods
  function getUniqueValues(data, key) {
    return [...new Set(data.map(item => item[key]))];
}
  function getDateFromSliderValue(sliderValue) {
    const startDate = new Date('2022-01-01'); // Start date of your data range
    const endDate = new Date('2024-12-31'); // End date of your data range

    // Calculate the time difference between the start and end dates
    const timeDiff = endDate.getTime() - startDate.getTime();

    // Map the slider value to a date within the data range
    const selectedDate = new Date(startDate.getTime() + (timeDiff * (sliderValue / 100)));

    return selectedDate;
}
function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  }

function filterData(data, delayvalmax, delayvalmin, dateSlidermax, dateSlidermin) {
    return data.filter(shipping => {
        const delay = parseInt(shipping.Delay);
        const shippingDate = new Date(shipping.SalesOrderCreationDate);
        const selectedDatemax = getDateFromSliderValue(dateSlidermax)
		const selectedDatemin = getDateFromSliderValue(dateSlidermin)

        // Check if the shipping delay and the shipping date meet the conditions
        return delay <= delayvalmax && delay >= delayvalmin && shippingDate <= selectedDatemax && shippingDate >= selectedDatemin;
    });
}

//Creating Sunburst
function Sunburst(data, { 
    path, 
    id = Array.isArray(data) ? d => d.id : null, 
    parentId = Array.isArray(data) ? d => d.parentId : null, 
    children, 
    value, 
    // Remove the sort function
    // sort = (a, b) => d3.descending(a.value, b.value), 
    label, 
    title, 
    link, 
    linkTarget = "_blank", 
    width = 600, 
    height = 400, 
    margin = 1, 
    marginTop = margin, 
    marginRight = margin, 
    marginBottom = margin, 
    marginLeft = margin, 
    padding = 1, 
    radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, 
    color = d3.interpolateRainbow, 
    fill = "#ccc", 
    fillOpacity = 0.6, 
} = {}) {
    const root = path != null ? d3.stratify().path(path)(data)
        : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
        : d3.hierarchy(data, children);

    value == null ? root.count() : root.sum(d => Math.max(0, value(d)));

    // Removed sorting of leaves

    d3.partition().size([2 * Math.PI, radius])(root);

    if (color != null) {
        color = d3.scaleSequential([0, root.children.length - 1], color).unknown(fill);
        root.children.forEach((child, i) => child.index = i);
    }

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 2 * padding / radius))
        .padRadius(radius / 2)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - padding);

    const svg = d3.create("svg")
        .attr("viewBox", [
            marginRight - marginLeft - width / 2,
            marginBottom - marginTop - height / 2,
            width,
            height
        ])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle");

    const cell = svg
        .selectAll("a")
        .data(root.descendants())
        .join("a")
        .attr("xlink:href", link == null ? null : d => link(d.data, d))
        .attr("target", link == null ? null : linkTarget);

    cell.append("path")
        .attr("d", arc)
        .attr("fill", color ? d => color(d.ancestors().reverse()[1]?.index) : fill)
        .attr("fill-opacity", fillOpacity)
        .on("click", handleSunburstClick);

    if (label != null) cell
        .filter(d => (d.y0 + d.y1) / 2 * (d.x1 - d.x0) > 10)
        .append("text")
        .attr("transform", d => {
            if (!d.depth) return;
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr("dy", "0.32em")
        .text(d => label(d.data, d));

    if (title != null) cell.append("title")
        .text(d => title(d.data, d));

    return svg.node();
}

  function updateChart() {
    // Perform data processing based on slider values
    const processedData = processDataSunburst(data.shippings, delaySliderMax, delaySliderMin, dateSlidermax, dateSlidermin);

    // Update the sunburst chart with the processed data
    updateSunburst(processedData);
  }
  function updateSunburst(data) {
    const chart = Sunburst(data, {
      value: d => d.value, // size of each node (file); null for internal nodes (folders)
      label: d => d.name, // display name for each cell
      title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}\n${n.value.toLocaleString("en")}`, // hover text
      width: 1152,
      height: 1152
    });
    d3.select(element).html('').append(() => chart);
  }
  function processDataSunburst(data, delayvalmax, delayvalmin, dateSlidermax, dateSlidermin) {
	  filteredData = filterData(data, delayvalmax, delayvalmin, dateSlidermax, dateSlidermin);
    // Function to group and count data
    const groupedCounts = filteredData.reduce((acc, curr) => {
        const key = `${curr.PlantKey}_${curr.Season}`; // Creating a unique key for each group
        acc[key] = (acc[key] || 0) + 1; // Incrementing the counter for the group
        return acc;
    }, {});

    // Convert the grouped counts map to an array of objects
    const result = Object.entries(groupedCounts).map(([key, count]) => {
        const [PlantKey, Season] = key.split('_'); // Splitting the key back into PlantKey and Season
        return { PlantKey, Season, Count: count };
    });
      const transformedData = {};
      result.forEach(({ PlantKey, Season, Count }) => {
        if (!transformedData[PlantKey]) {
          transformedData[PlantKey] = {};
        }
        if (!transformedData[PlantKey][Season]) {
          transformedData[PlantKey][Season] = parseInt(Count);
        }
      });
  
      const formattedData = {
        name: 'root',
        children: Object.entries(transformedData).map(([plantKey, seasons]) => ({
          name: `PlantKey ${plantKey}`,
          children: Object.entries(seasons).map(([season, delay]) => ({
            name: season,
            value: delay
          }))
        }))
      };

    formattedData.children = formattedData.children.filter(plant => {
      return plant.children.length > 1 || (plant.children.length === 1 && plant.children[0].name !== "undefined");
    });

    return formattedData;
  }

  //Creating Barchart
  function handleSunburstClick(event) {
    const clickedElement = event.target;
    const data = d3.select(clickedElement.parentNode).datum();
    const plantKeyInfo = data ? data.data.name : "No data bound";
    const plantKey = plantKeyInfo.replace(/[^0-9]/g, '')
    selectedPlantKey = plantKey
    processedData = processDataBarchart(filteredData, plantKey);
    uniqueCountries = getUniqueValues(processedData, "CustomerCountry")
    selectedCountry = uniqueCountries[0]
    updateBarchart(selectedCountry)

}
function updateBarchart(selectedCountry) {
  const filtcount = processedData.filter(item => item.CustomerCountry === selectedCountry);
  console.log(filtcount)
    const chart = Barchart(filtcount);
    d3.select(barchartelem).html('').append(() => chart);
  }

  function handleCountryChange(event) {
    // Retrieve the selected country from the event
    selectedCountry = event.target.value;
    
    // Update the bar chart based on the selected country
    updateBarchart(selectedCountry);
}
function Barchart(data, {
    value = d => d.NrOfDelays,
    label = d => `${d.CustomerName}, ${d.NrOfDelays}`, // Modified label function
    width = 640,
    height = 400,
    margin = 1,
    marginTop = margin,
    marginRight = margin + 150,
    marginBottom = 30, // Increased margin for x-axis
    marginLeft = margin,
    fillOpacity = 0.6,
    nameMargin = 5,
} = {}) {
    // Sort the data array by NrOfDelays in descending order
    data.sort((a, b) => b.NrOfDelays - a.NrOfDelays);
    
    // Limit the data to the first 15 elements
    const limitedData = data.slice(0, 15);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end");

    const x = d3.scaleLinear()
        .domain([0, d3.max(limitedData, value)])
        .range([marginLeft, width - marginRight - nameMargin]); // Adjusted range for the x-scale

    const y = d3.scaleBand()
        .domain(limitedData.map(label))
        .range([marginTop, height - marginBottom])
        .padding(0.1);

    svg.selectAll(".bar")
        .data(limitedData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y(label(d)))
        .attr("width", d => x(value(d)) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => colorScale(i))
        .attr("fill-opacity", fillOpacity)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill-opacity", 1); // Highlight the bar on hover
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("fill-opacity", fillOpacity); // Restore opacity on mouseout
        });

    svg.selectAll(".bar-label")
        .data(limitedData)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", d => x(value(d)) - 5) // Adjusted x-position
        .attr("y", d => y(label(d)) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => label(d)); // Displaying customer name and number of delays

    // Add x-axis
    const xAxis = d3.axisBottom(x).tickSize(0);
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(xAxis);

    return svg.node();
}
  function processDataBarchart(data, plant) {
    const filtplant = data.filter(shipping => {
        // Check if the shipping delay and the shipping date meet the conditions
        return shipping.PlantKey === plant;  })
    
    const groupedData = filtplant.reduce((acc, curr) => {
        const { CustomerCountry, CustomerName } = curr;
        const key = `${CustomerCountry}-${CustomerName}`;
            
        if (!acc[key]) {
            acc[key] = { CustomerCountry, CustomerName, NrOfDelays: 0 };
            }

        acc[key].NrOfDelays += 1;
        return acc;
    }, {});

    return Object.values(groupedData);
    }
  
	  onMount(() => {
    // Initialize chart when component mounts
    updateChart();
  });
	
</script>

<div class="container">
  <div class="header">
      <h1>History of Shipping Delays per Plant</h1>
  </div>

  <div class="row">
      <div class="interval-container">
          <h2 class="subheading">Custom Time Intervals</h2>
          <p>Selected Max Date: {formatDate(new Date(dateRange[0].getTime() + (dateSlidermax * (dateRange[1].getTime() - dateRange[0].getTime()) / 100)))}</p>
          <input type="range" min="0" max="100" bind:value={dateSlidermax} on:input={updateChart} />

          <p>Selected Min Date: {formatDate(new Date(dateRange[0].getTime() + (dateSlidermin * (dateRange[1].getTime() - dateRange[0].getTime()) / 100)))}</p>
          <input type="range" min="0" max="{dateSlidermax}" bind:value={dateSlidermin} on:input={updateChart} />
      </div>

      <div class="interval-container">
          <h2 class="subheading">Custom Delay Intervals</h2>
          <p>Selected Delay Max: {delaySliderMax} days</p>
          <input type="range" min="1" max="14" bind:value={delaySliderMax} on:input={updateChart} />

          <p>Selected Delay Min: {delaySliderMin} days</p>
          <input type="range" min="1" max="{delaySliderMax}" bind:value={delaySliderMin} on:input={updateChart} />
      </div>
  </div>

  <div class="row">
      <div class="visualization">
          <h2>Sunburst of Shipping Delays per Plant and Season</h2>
          <div bind:this={element}></div>
      </div>

      {#if selectedPlantKey !== null}
          <div class="visualization">
              <h2>Customers with most shipping delays between {delaySliderMin} and {delaySliderMax} days in {selectedCountry}</h2>
              <div>
                  <label for="country-select">Select Country:</label>
                  <select id="country-select" bind:value={selectedCountry} on:change={handleCountryChange}>
                      {#each uniqueCountries as country}
                          <option value={country}>{country}</option>
                      {/each}
                  </select>
              </div>

              <div bind:this={barchartelem}></div>
          </div>
      {/if}
  </div>
</div>
<style>
    .subheading {
        font-size: 16px; /* Adjust the font size as needed */
    }
    .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    margin-bottom: 20px;
}

.header h1 {
    text-align: left;
}

.row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
}

.interval-container {
    flex: 1;
    margin-right: 10px;
}

.visualization {
    text-align: center;
}
</style>

