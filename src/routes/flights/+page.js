import Papa from 'papaparse'

export const load = async ({ fetch }) => {
    const responseFlowers = await fetch('https://raw.githubusercontent.com/domoritz/maps/master/data/iris.json')
    const dataFlowers = await responseFlowers.json()
    dataFlowers.forEach((d,i) => { d.id = i, d.species = "Iris " + d.species })


    const responseFlights = await fetch('https://vda-lab.gitlab.io/datavis-technologies/assets/flights_part.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvFlights = await responseFlights.text()
    let parsedCsvFlights = Papa.parse(csvFlights, {header: true})

    return {
      flowers: dataFlowers,
      flights: parsedCsvFlights.data
    }
}