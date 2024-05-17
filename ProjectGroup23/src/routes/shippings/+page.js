import Papa from 'papaparse'

export const load = async ({ fetch }) => {
  const responseShipping = await fetch('https://raw.githubusercontent.com/BlimnJorge/DataViz/main/SalesCustomersFVV.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvShipping = await responseShipping.text()
    let parsedCsvShipping = Papa.parse(csvShipping, {header: true})

    return {
      shippings: parsedCsvShipping.data    }
}