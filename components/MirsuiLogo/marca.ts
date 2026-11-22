/**
 * Geometria da marca do Mirsui: o "furo".
 *
 * O contorno foi traçado da arte de origem (referencia/marca/
 * mirsui-furo-master.png) com potrace, depois de desfocar a borda para tirar
 * o serrilhado da imagem, e não redesenhado à mão. Da arte só sai o símbolo;
 * o nome continua como texto, em Archivo, ao lado dele.
 *
 * O furo é vazado, não pintado com a cor do fundo: o símbolo aparece sobre o
 * header mostarda, sobre o papel claro e sobre o tema escuro, e o furo tem de
 * mostrar o que estiver atrás.
 *
 * A caixa é 137x100 porque a marca é 1,37:1. Assim `size` continua valendo
 * como altura.
 */

export const MARCA_VIEWBOX = '0 0 137 100'

/** largura / altura — para dimensionar a partir da altura desejada */
export const MARCA_RAZAO = 137 / 100

/** o corpo com o furo; precisa de fill-rule evenodd */
export const MARCA_FURO =
    'M40.2 99.9C35.7 99.7 31 97.5 25.8 93.2C25.3 92.7 24.3 91.9 23.6 91.3C22.8 90.7 21.6 89.6 20.8 88.8C20.1 88.1 18.8 86.9 18 86.1C17.2 85.4 16 84.1 15.2 83.3C14.5 82.5 13.4 81.3 12.7 80.6C10.7 78.4 7.3 74.5 5.3 71.9C1.4 66.9 -0.2 62.3 0.2 57C0.4 53.8 0.7 51.9 2.3 46.2C3.1 43.3 5.2 37.2 6.3 34.6C6.6 33.9 7.1 32.8 7.4 32.1C8.4 29.7 10.6 25.1 11.8 23.2C12 22.8 12.6 21.8 13.1 21C14.3 19 15.7 17 16.2 16.7C16.5 16.5 16.9 16.6 18.2 17C22.5 18.4 27.3 18.8 31 18C38.8 16.4 44.8 12.2 50 4.8C51.4 2.8 53.2 1.7 56 0.9C62.3 -1 66.6 0.3 80.7 7.8C81.3 8.2 82.4 8.7 83 9C83.7 9.4 84.7 9.9 85.2 10.2C85.8 10.5 86.8 11.1 87.6 11.4C88.3 11.8 89.6 12.5 90.3 12.9C91 13.3 92.3 14 93 14.4C93.8 14.8 95.1 15.5 96 16C99.8 18.1 103.2 19.8 108.8 22.7C110 23.2 111.6 24.1 112.6 24.6C113.5 25.1 115.7 26.2 117.5 27.1C130.7 33.8 133.4 35.4 135 37.9C138.1 42.5 137.1 47.2 132.3 51.1C130 52.9 128.8 53.6 124.8 55.8C124.1 56.1 123.1 56.7 122.6 57C122 57.3 121.1 57.8 120.5 58.1C119.9 58.4 118.7 59.1 117.9 59.5C117 60 115.4 60.9 114.3 61.4C109.7 63.8 100.2 69 97.4 70.6C96.7 71.1 95.6 71.7 95.1 72C94.5 72.3 92.7 73.3 91 74.4C89.3 75.4 87.4 76.5 86.9 76.8C86.3 77.1 85.1 77.9 84.1 78.4C82.4 79.6 80 81.1 78.8 81.8C78.4 82 76.9 83 75.4 84C74 84.9 72.2 86.1 71.6 86.4C71 86.8 69.6 87.7 68.6 88.3C67.6 89 66.4 89.8 65.9 90.1C65.3 90.3 64.3 91 63.5 91.5C61.9 92.5 61.2 92.8 57.9 94.6C53.7 96.8 52.3 97.4 49.4 98.5C45.5 99.8 43.7 100.1 40.2 99.9ZM45.9 84.5C68.8 82.7 84.4 56.6 73.8 37.7C70 30.8 64 26.3 56.7 24.6C46.6 22.4 36.1 25.3 28 32.5C14.1 44.8 12.3 65 24 76.9C25.5 78.3 28.7 80.7 30.5 81.6C35.1 83.8 40.6 84.9 45.9 84.5Z'
