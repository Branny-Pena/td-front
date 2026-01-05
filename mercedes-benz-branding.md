# Guía UI (extracto) — Color, Tipografía, Botones y Stepper (Sitio web distribuidores MB LATAM)

> Basado en la “Guía para diseño y estructura del sitio web de distribuidores de Latina 2025”.

---

## 1) Sistema de color: cómo usarlo y cuándo

### 1.1 Principios
- El esquema digital se compone de **superficies de color** (con o sin degradados) definidas para contenidos específicos. :contentReference[oaicite:0]{index=0}  
- La proporción de color es **variable** y depende del enfoque comunicacional y profundidad del contenido. :contentReference[oaicite:1]{index=1}  
- Para texto accesible, usa **combinaciones con contraste AA (WCAG) > 4.5** (contra `wb-black` o `wb-white`). :contentReference[oaicite:2]{index=2}  

### 1.2 Reglas prácticas
- **Usa tokens/variables del sistema** (ej. `wb-grey-70`, `wb-blue-45`) en vez de “inventar” colores nuevos.
- **Neutros primero**: base en blancos/negros/grises para estructura y lectura; acentos (azules/rojos/verdes/amarillos) solo para énfasis o estados.
- **Modo claro/oscuro**: elige según la imagen/fondo para asegurar legibilidad del contenido superpuesto. :contentReference[oaicite:3]{index=3}  

### 1.3 Divisores (separadores)
- Úsalos para separar componentes **solo cuando el espacio en blanco no sea suficiente**. :contentReference[oaicite:4]{index=4}  
- Si debe ser claramente visible y accesible, usa una variación **clara**; si debe llamar la atención, usa una variación **destacada**; en general, **con moderación**. :contentReference[oaicite:5]{index=5}  
- Disponibles para **tema claro/oscuro** y orientación horizontal/vertical. :contentReference[oaicite:6]{index=6}  

---

## 2) Tipografía: cómo usarla y cuándo

### 2.1 Familias tipográficas
- Fuentes de marca: **MBCorpoA** y **MBCorpoS** (web). :contentReference[oaicite:7]{index=7}  
- Objetivo: estructurar jerarquía de **título, subtítulo y cuerpo** de forma consistente. :contentReference[oaicite:8]{index=8}  
- Escalado: los tamaños se ajustan (escalan) según la ventana gráfica para funcionar en desktop y mobile. :contentReference[oaicite:9]{index=9}  

### 2.2 Guía de uso (regla simple)
- **Títulos / encabezados**: usa **MBCorpoA** para dar carácter de marca y jerarquía.
- **Cuerpo / UI / etiquetas**: usa **MBCorpoS** para lectura continua y componentes.
- Mantén jerarquía clara: un solo estilo de título por sección, y evita “tunear” tamaños fuera de la escala definida.

> Nota para escenarios/banner: “Siempre debe haber un titular definido; la sublínea es opcional; no está permitido cambiar el tamaño y tipo de fuente del titular y sublínea.” :contentReference[oaicite:10]{index=10}  

---

## 3) Botones (Call to Action): diseño y uso

### 3.1 Composición (Home / Banner)
- En el banner de Home debe haber botones CTA: **uno azul profundo #0078d6** (principal) y **otro transparente** (secundario). :contentReference[oaicite:11]{index=11}  

### 3.2 Ubicación recomendada
- Desktop: CTA principal **a la derecha**.  
- Mobile: CTA principal **arriba**; CTA secundario **abajo** y alineado a la izquierda. :contentReference[oaicite:12]{index=12}  

### 3.3 Texto del botón (microcopy)
- Debe ser conciso: **1–2 palabras**, máximo **4 palabras**, y **< 20 caracteres** (incluye espacios). :contentReference[oaicite:13]{index=13}  
- No uses puntuación (puntos/exclamaciones). :contentReference[oaicite:14]{index=14}  
- Si es inevitable, puede tener **2 líneas** (centradas o alineadas a la izquierda). :contentReference[oaicite:15]{index=15}  

### 3.4 Tamaños (altura) — usa 1 tamaño por contexto/fila
| Tamaño | Altura | Cuándo usar |
|---|---:|---|
| L | 56px | Con formularios/campos de entrada y acciones principales de alta prioridad |
| M | 48px | Para la mayoría de combinaciones de varios botones cercanos |
| S | 40px | Para soluciones muy compactas |
:contentReference[oaicite:16]{index=16}  

### 3.5 Restricción importante en imágenes
- Si en la imagen aparece la **estrella de Mercedes-Benz (sobre el auto)**, **no debe ser cubierta** por elementos del escenario como botones CTA. :contentReference[oaicite:17]{index=17}  

---

## 4) Stepper: cuándo usarlo, cómo se diseña y reglas

### 4.1 Cuándo usarlo
- Para procesos “grandes” con varios pasos/páginas o mucho contenido; ayuda a simplificar y a seguir el viaje del usuario. :contentReference[oaicite:18]{index=18}  
- No lo uses en tareas pequeñas/sencillas. :contentReference[oaicite:19]{index=19}  

### 4.2 Qué debe comunicar (obligatorio)
- Debe indicar: **paso actual**, **qué ya está hecho** y **qué falta**. :contentReference[oaicite:20]{index=20}  
- Incluye estados de **advertencia y error** para pasos visitados cuando algo requiere atención. :contentReference[oaicite:21]{index=21}  

### 4.3 Reglas de interacción
- Permite navegar hacia atrás a pasos ya completados. :contentReference[oaicite:22]{index=22}  
- Respeta el orden: **no permitir avanzar** si el paso actual está incompleto (solo retroceder). :contentReference[oaicite:23]{index=23}  

### 4.4 Etiquetas (labels)
- No son textos de ayuda: usa etiquetas **cortas, descriptivas (1–2 palabras)** para escaneo rápido. :contentReference[oaicite:24]{index=24}  

### 4.5 Consistencia visual
- No mezcles variantes (íconos vs números): elige una y respétala en todo el flujo. :contentReference[oaicite:25]{index=25}  

---

## (Opcional pero recomendado) Indicadores de carga (consistencia UI)
- “Indeterminado”: animación en bucle; mínimo **2 segundos** para indicar que el sistema está trabajando/actualizando. :contentReference[oaicite:26]{index=26}  
- Indicador lineal: Default **4px** y Compacto **2px**; evita esquinas redondeadas si hay varios loaders juntos. :contentReference[oaicite:27]{index=27}  
