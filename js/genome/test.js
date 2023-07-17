let a = new ATNeuralNetwork(2, 3);
a.initialize();
console.log(a.connections.toString());
a.applyMutations(0, 0, 1);
console.log(a.connections.toString());
let b = new ATNeuralNetwork(2, 2);
b.initialize();
console.log(b.connections.toString());
let c = a.crossover(b)
console.log(c.connections.toString());
