import Papa from 'papaparse'
console.log("At least this file is alive");
function filterData(data, delayRange, dateRange) {
    const [delayMin, delayMax] = delayRange;
    const [dateMin, dateMax] = dateRange.map(date => new Date(date).getTime());
  
    return data.filter(flight => {
      const delay = parseInt(flight.Delay);
      const creationDate = new Date(flight.SalesOrderCreationDate).getTime();
  
      return delay >= delayMin && delay <= delayMax &&
             creationDate >= dateMin && creationDate <= dateMax;
    });
  }
async function fetchDataAndTransform() {
    // Construct the full file path to the CSV file
    const responseFlights = await fetch('https://raw.githubusercontent.com/BlimnJorge/DataViz/main/SalesDelays.csv', {
        headers: {
          'Content-Type': 'text/csv'
      }})
    // Fetch the CSV file
    const csvText = await responseFlights.text();

    console.log("Initial Data is gathered successfully");
    
    // Parse the CSV data using Papa Parse
    const { data: parsedData } = Papa.parse(csvText, { header: true }); // Assuming the first row contains headers
    console.log(parsedData)
    // Transformation logic

    // Example usage
    const delayRange = [3, 7]; // Replace with actual slider values
    const dateRange = ["2022-01-01", "2024-01-31"]; // Replace with actual slider values

    const filteredData = filterData(parsedData, delayRange, dateRange);
    console.log(filteredData);
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

    console.log(result);


}

    async function fetchWantedData() {
        const responseFlights = await fetch('https://raw.githubusercontent.com/BlimnJorge/DataViz/main/SunburntDataPlantKeySeason1.csv', {
        headers: {
          'Content-Type': 'text/csv'
      }})
    // Fetch the CSV file
    const csvText = await responseFlights.text();

    console.log("Initial Data is gathered successfully");
    
    // Parse the CSV data using Papa Parse
    const { data: parsedData } = Papa.parse(csvText, { header: true }); // Assuming the first row contains headers
    console.log(parsedData)
    }
// Call the function to fetch and transform the data
fetchDataAndTransform();