let estoque = 20;
let compra = parseInt(prompt("Quantas unidades deseja comprar?"));

if (compra > estoque) {
  console.log("Estoque insuficiente!");
} else {
  estoque -= compra;
  console.log(`Venda realizada. Restam ${estoque} unidades no estoque.`);
}