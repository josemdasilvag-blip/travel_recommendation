# Wanderlynx Travel — demo de recomendaciones

[Probar la demo](https://josemdasilvag-blip.github.io/travel_recommendation/)

Proyecto final de JavaScript Essentials. **Wanderlynx Travel es una marca ficticia** creada para mostrar una interfaz de recomendaciones de viaje. No es una agencia, no acepta reservas ni recibe mensajes.

## Qué hace

- Busca por categorías como `beach`, `temple` o `country`, y por nombre de destino.
- Lee los destinos de `travel_recommendation_api.json` y muestra fotografías, descripciones y hora local.
- Permite limpiar la búsqueda y consultar cómo está construida la demo.

Los destinos y textos son datos de ejemplo para el ejercicio. La página se ejecuta con HTML, CSS y JavaScript, sin backend ni cuentas de usuario.

## Ejecutarla en local

El navegador necesita servir el JSON por HTTP. Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Después abre `http://localhost:8000/`.

## Archivos principales

| Archivo | Función |
| --- | --- |
| `index.html` | Interfaz y resultados de búsqueda |
| `travel_recommendation.js` | Carga, búsqueda y renderizado |
| `travel_recommendation_api.json` | Datos de ejemplo |
| `travel_recommendation.css` | Estilos y diseño adaptable |
| `about_us.html` | Alcance y límites de la demo |

Hecho como proyecto de aprendizaje por José Manuel Da Silva.
