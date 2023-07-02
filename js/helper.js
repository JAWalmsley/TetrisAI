/**
    Gaussian random generation using Box-Muller transform.
    This is a random function that can center around 0 with a known standard deviation. Causes, on average, more chance to mutate a smaller amount.
    https://stackoverflow.com/a/36481059/15818758
*/
function gaussianRandom(mean = 0, stdev = 0.5) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}