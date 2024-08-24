onmessage = function(event) {
    // const size: number = event.data[0]
    // const my_neural: neural_type = event.data[1]
    // const volume: number[][][] = event.data[2]
    // const kernel: number[][][] = event.data[3]

    let update = true
    postMessage([update])
}