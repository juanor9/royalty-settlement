# Liquidación de Regalías

Este es un programa de liquidación de regalías que procesa archivos XML de facturas electrónicas y genera un archivo de Excel con la información de ventas. Se utilizan las [etiquetas estandarizadas por la DIAN](https://www.dian.gov.co/normatividad/Proyectosnormas/Anexo%201%20-%20Proyecto%20Resolución%20000000%20-%2011032019%20-%20Soporte%20Tecnico.pdf) (Dirección de Impuestos y Aduanas Nacionales de Colombia), pero es posible que pueda aplicarse a archivos xml generados por entidades de otros países. El programa solicita al usuario los detalles necesarios, como el autor, los libros y los porcentajes de regalías. Luego, analiza los archivos XML y calcula las regalías generadas para cada libro. Finalmente, ofrece la opción de generar un archivo de Excel con la información recopilada.

## Requisitos

- Node.js instalado en el sistema

## Instalación

1. Clona o descarga este repositorio en tu máquina local.
    ```shell
    git clone https://github.com/juanor9/royalty-settlement.git
    ```
2. Abre una terminal y navega hasta el directorio del proyecto.
    ```shell
    cd xml-fe-analizer
    ```
3. Ejecuta el siguiente comando para instalar las dependencias:

   ```shell
   npm install
   ```
## Instrucciones de uso
1. Asegúrate de tener los archivos XML de las facturas que deseas analizar en la carpeta xml-billing.
2. Ejecuta el siguiente comando para iniciar el análisis de los archivos XML:
    ```shell
    npm start
    ```
3. Responde la primera pregunta:
    ```shell
    ¿A qué autor quieres hacer la liquidación de regalías?
    ```
    El nombre se usará solamente para nombrar el archivo final.
4. Responde la segunda pregunta:
    ```shell
    Por favor indica los isbn de los libros sobre los que quieres liquidar regalías. Incluye el código tal cual está registrado en las facturas. Separa cada código por una coma (,).
    ```
    Es importante que los códigos que ingreses coincidan con los códigos tal y como aparecen en las facturas generadas por facturación electrónica. Puedes guiarte por el pdf que suele acompañar las facturas electrónicas.
5. Responde la tercera pregunta:
    ```shell
    Ingrese el porcentaje de regalías para el libro *código de libro*. Por favor escribe solo el número sin el signo %:
    ```
    Ingresa solamente el número entero sin el signo "%". Si el porcentaje es 5%, ingresa "5", no "5%" ni "0.05". 
6. A continuación, en la consola aparecerá toda la información extraída de los archivos xml en la carpeta de la siguiente manera:
    ``` shell
        {
          id: 'Número de identificación de la factura',
          date: 'fecha de generación de la factura',
          isbn: 'código del ítem facturado',
          book: 'nombre del ítem facturado',
          PVP: 'precio bruto facturado',
          ammount: 'cantidad de ítems facturados',
          billed: 'total facturado',
          royalties: 'porcentaje de regalías en número decimal',
          payedRoyalties: 'total de regalías a pagar por la factura'
        }
    ```
7. Responde la última pregunta:
    ``` shell
    ¿Quieres generar un archivo de Excel con esta información? (y/n)
    ```
    Responde "y" si quieres generar el archivo de Excel, o "n" si no.
    El archivo se creará en la carpeta "excel-files".
## Contribución
Si deseas contribuir a este proyecto, siéntete libre de hacer un fork y enviar tus pull requests.