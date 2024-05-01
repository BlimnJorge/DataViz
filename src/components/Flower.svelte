<script>
    // A datapoint looks like this:
    // { petalLength: 1.4,
    //   petalWidth: 0.2,
    //   sepalLength: 5.1,
    //   sepalWidth: 3.5,
    //   species: "setosa" }

    export let datapoint = {};

    let scale = 3;
    $: sl = scale * datapoint.sepalLength;
    $: sw = scale * datapoint.sepalWidth;
    $: pl = scale * datapoint.petalLength;
    $: pw = scale * datapoint.petalWidth;
    $: sepal_path =
        "M 0,0 " + "C " + sl + ",-" + sw + " " + sl + "," + sw + " 0,0 Z";
    $: petal_path =
        "M 0,0 " + "C " + pl + ",-" + pw + " " + pl + "," + pw + " 0,0 Z";
</script>

<g>
    <circle cx="0" cy="0" r="10" class={datapoint.species} />
    <path style="transform: rotate(270deg)" d={sepal_path} />
    <path style="transform: rotate(30deg)" d={sepal_path} />
    <path style="transform: rotate(150deg)" d={sepal_path} />
    <path style="transform: rotate(325deg)" d={petal_path} />
    <path style="transform: rotate(90deg)" d={petal_path} />
    <path style="transform: rotate(210deg)" d={petal_path} />
</g>

<style>
    circle.setosa {
        fill: #7570b3;
        fill-opacity: 0.3;
    }
    circle.virginica {
        fill: #1b9e77;
        fill-opacity: 0.3;
    }
    circle.versicolor {
        fill: #d95f02;
        fill-opacity: 0.3;
    }
</style>