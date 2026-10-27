---
name: diseno-frontend-2026
description: "Guía el diseño y la implementación de interfaces web actuales para el frontend de esta aplicación: dirección visual, responsive, accesibilidad, microinteracciones y tendencias web consolidadas en 2026. Úsala al crear o rediseñar páginas, componentes, estilos o flujos de usuario en React."
---

# Diseño frontend para la aplicación

Diseña interfaces actuales, coherentes y útiles para la aplicación de libros. Usa las tendencias consolidadas en 2026 como herramientas, nunca como una lista obligatoria de efectos visuales. La experiencia, la identidad del producto, la accesibilidad y el rendimiento tienen prioridad sobre la novedad.

## Contexto técnico del proyecto

- El frontend usa React 19, TypeScript, Vite y CSS.
- Antes de implementar, inspecciona la página, los componentes y los estilos existentes; conserva los patrones que ya funcionen.
- No supongas que hay Tailwind, una biblioteca de componentes, iconos o fuentes instalada. Reutiliza lo disponible y evita agregar dependencias sin una necesidad clara y aprobación.
- Mantén la estructura modular por funcionalidad y evita mezclar reglas de negocio con presentación.

## Criterios de diseño

1. **Empieza por las personas y su tarea.** Identifica el objetivo de la página, la información prioritaria y la acción principal antes de escoger colores, efectos o composición. En un catálogo de libros, facilita descubrir, buscar, comparar y gestionar libros.
2. **Establece una jerarquía visual clara.** Usa tipografía legible, espaciado consistente, alineación y contraste para guiar la lectura. Limita la cantidad de estilos, colores de énfasis y niveles de elevación. Evita decorar cada bloque como una tarjeta.
3. **Diseña desde móvil hasta escritorio.** Usa layouts fluidos, puntos de quiebre basados en el contenido y controles cómodos al tacto. En pantallas estrechas, reorganiza o transforma tablas y navegación sin ocultar información ni acciones esenciales. Evita desbordamiento horizontal accidental.
4. **Usa sistemas visuales coherentes.** Centraliza colores, tipografía, espaciado, radios, sombras y estados repetidos en tokens CSS cuando aporten consistencia. Reutiliza componentes y variantes para controles con el mismo propósito; no dupliques estilos para cada pantalla.
5. **Haz que la interfaz sea accesible.** Usa HTML semántico, etiquetas visibles, nombres accesibles, orden de foco lógico y estados `:focus-visible` notorios. No transmitas información solo mediante color, forma o movimiento. Respeta `prefers-reduced-motion` y mantén contraste suficiente en texto, controles y estados.
6. **Añade movimiento con intención.** Usa transiciones breves para confirmar acciones, cambios de estado o relaciones entre elementos. Mantén controles y contenido estables y perceptibles; no uses animaciones, parallax o desplazamientos que retrasen tareas o dificulten el acceso.
7. **Aplica tendencias con criterio.** Composiciones editoriales, tipografía expresiva, superficies sutiles, gradientes, temas oscuros y microinteracciones pueden aportar identidad si mejoran comprensión y coherencia. Bento grids, glassmorphism, efectos 3D y elementos generados con IA no son objetivos en sí mismos: úsalos solo si sirven al contenido y siguen siendo legibles, accesibles y rápidos.
8. **Protege la confianza y la velocidad.** Mantén acciones, estados, errores y precios comprensibles; no uses patrones visuales engañosos. Evita imágenes pesadas, animaciones costosas y cambios de layout evitables. Conserva los indicadores de carga, vacío, éxito y error.

## Flujo de trabajo

1. Inspecciona la pantalla, los estilos, los componentes compartidos y cualquier flujo relacionado que pueda verse afectado.
2. Resume para ti el propósito de la página, su acción principal, su contenido esencial y los estados que debe mostrar.
3. Propón una dirección visual pequeña y coherente con el resto de la aplicación; distingue entre mejoras de usabilidad y decisiones puramente decorativas.
4. Implementa con componentes React tipados y CSS alineado con los patrones existentes. Reutiliza estilos y controles del proyecto, y mantén separadas las responsabilidades.
5. Verifica los estados normal, hover, foco, deshabilitado, carga, vacío y error que correspondan. Comprueba teclado, lector de pantalla en controles importantes, movimiento reducido, contraste y anchos móvil y escritorio.
6. Ejecuta las comprobaciones frontend configuradas en el proyecto (lint, build o pruebas pertinentes) y resuelve los problemas introducidos por el cambio.

## Evita

- Rediseñar pantallas ajenas al alcance o cambiar una identidad visual funcional sin una razón vinculada al producto.
- Añadir efectos de moda, fondos, gradientes, sombras, animaciones o tarjetas por defecto.
- Usar emoji como sustituto de iconografía de interfaz, texto de bajo contraste, tipografía diminuta o controles sin estados de foco.
- Eliminar contenido o funciones para hacer que una composición móvil parezca más simple.
- Introducir dependencias, fuentes externas o recursos remotos solo para conseguir un efecto visual.
- Declarar el diseño terminado sin comprobar responsive, accesibilidad básica y los estados de interacción afectados.
