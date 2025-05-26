# Documentación de Servicios de Machine Learning para RRHH

Este documento describe los servicios de Machine Learning implementados para la aplicación de Recursos Humanos.

## 1. Servicio de K-Means (Estimación de Probabilidad de Rotación)

Este servicio se encuentra en la carpeta `backend-ml/K-Means/` y tiene como objetivo agrupar a los empleados en clústeres para estimar su probabilidad de rotación.

### Propósito
Identificar grupos de empleados con diferentes perfiles de comportamiento o rendimiento que puedan indicar una mayor o menor probabilidad de dejar la empresa.

### Componentes y Flujo

1.  **`dataset_empleados_kmeans.xlsx` (Archivo de Entrada)**
    *   Este es el archivo Excel que debe contener los datos brutos de los empleados para el análisis.
    *   Columnas relevantes esperadas (ejemplos, ajustar según el dataset real):
        *   `Nombre`: Nombre del empleado.
        *   `Ciclo`: Periodo (ej. `202401` para Enero 2024) al que corresponden los datos.
        *   `Rendimiento ACTUAL`: Categoría del rendimiento actual (ej. Alto, Medio, Bajo).
        *   `Ausencias Injustificadas`: Número de ausencias.
        *   `Llegadas tarde`: Número de llegadas tarde.
        *   `Salidas tempranas`: Número de salidas tempranas.
        *   Otras métricas relevantes...

2.  **`filtrar_dataset.py` (Script de Filtrado)**
    *   **Función**: Filtra el archivo `dataset_empleados_kmeans.xlsx` basado en un rango de `Ciclo` (actualmente hardcodeado en el script para `202401` a `202412`).
    *   **Entrada**: Lee `dataset_empleados_kmeans.xlsx` desde la misma carpeta donde se ejecuta.
    *   **Salida**: Crea un nuevo archivo `dataset_empleados_filtrado.xlsx` en la misma carpeta, conteniendo solo las filas dentro del rango de ciclo especificado.

3.  **`K-Means-Rotacion.py` (Script de Clustering)**
    *   **Función**: Aplica el algoritmo K-Means sobre `dataset_empleados_filtrado.xlsx` para agrupar empleados.
    *   **Entrada**: Lee `dataset_empleados_filtrado.xlsx`.
    *   **Preprocesamiento Principal**:
        *   **Codificación de "Rendimiento ACTUAL"**: Utiliza `OneHotEncoder` para convertir la columna categórica "Rendimiento ACTUAL" en columnas numéricas (ej. `Rendimiento ACTUAL_Alto`, `Rendimiento ACTUAL_Medio`, `Rendimiento ACTUAL_Bajo`).
        *   **Agrupación**: Agrupa los datos por "Nombre" y suma otras métricas numéricas si un empleado tiene múltiples registros (aunque el diseño parece esperar un registro por empleado después del filtrado por ciclo).
        *   **Escalado**: Aplica `MinMaxScaler` a las columnas numéricas seleccionadas para normalizar sus rangos.
    *   **Clustering**:
        *   Utiliza `KMeans` de `scikit-learn` con un número de clústeres hardcodeado (actualmente `n_clusters = 3`).
        *   Asigna a cada empleado a un clúster.
    *   **Interpretación de Clústeres y Salida**:
        *   Mapea los números de clúster (0, 1, 2) a una "Probabilidad de Rotacion" categórica:
            *   Cluster 2: "ALTA"
            *   Cluster 0: "BAJA"
            *   Cluster 1: "MEDIA"
            *(Nota: Esta interpretación es fija y podría necesitar ajuste basado en el análisis de los centroides de los clústeres en un escenario real).*
        *   Prepara un DataFrame final con "Nombre", "Probabilidad de Rotacion", y otras métricas relevantes.
        *   **Salida (stdout)**: Imprime un objeto JSON que contiene:
            *   `data`: Un array de objetos, donde cada objeto es un empleado con sus datos y la probabilidad de rotación asignada.
            *   `clusters`: El número de clústeres utilizado.
            *   `status`: "success" o "error".

4.  **`app.py` (Aplicación Flask)**
    *   **Endpoint**: Define un endpoint HTTP POST en `/kmeans`.
    *   **Orquestación**:
        1.  Al recibir una petición, primero ejecuta el script `filtrar_dataset.py`.
        2.  Si el filtrado es exitoso, ejecuta el script `K-Means-Rotacion.py`.
        3.  Captura la salida JSON de `K-Means-Rotacion.py` y la devuelve como respuesta HTTP.
    *   **Manejo de Errores**: Devuelve un JSON con un mensaje de error si alguno de los scripts falla.

## 2. Servicio de Regresión Lineal (Predicción de Desempeño Futuro)

Este servicio se encuentra principalmente en `backend-ml/app.py` y utiliza lógica de los scripts en `backend-ml/Regresion lineal/`. Su objetivo es predecir el desempeño futuro de los empleados.

### Propósito
Estimar una puntuación numérica del desempeño futuro de los empleados basada en sus características y rendimiento actual/pasado.

### Componentes y Flujo (controlado por `backend-ml/app.py`)

1.  **Endpoint `/api/ml/regression/train` (POST)**
    *   **Función**: Entrenar un modelo de regresión lineal y guardarlo.
    *   **Entrada**: Un archivo CSV enviado como `multipart/form-data` bajo la clave `file`.
        *   **Columnas Esperadas en el CSV de Entrenamiento (ejemplos):**
            *   `nombre`: Identificador del empleado.
            *   `area`: Área funcional del empleado (ej. 'Ventas', 'Desarrollo').
            *   `puntaje`: Puntuación actual o histórica.
            *   `desempeño`: Categoría de desempeño actual (ej. 'alto', 'medio', 'bajo').
            *   `cantidad_proyectos`: Número de proyectos.
            *   `jerarquia`: Nivel jerárquico (ej. 'senior', 'junior', 'trainee').
            *   `horas_extra`: Booleano o 0/1 indicando si realiza horas extra.
            *   `asistencia_puntualidad`: Métrica de asistencia/puntualidad.
            *   `desempeño_futuro`: La variable objetivo numérica que el modelo aprenderá a predecir.
    *   **Proceso (adapta la lógica de `Regresion lineal/regresion.py`):**
        1.  Guarda el archivo CSV subido.
        2.  **Preprocesamiento**:
            *   Codificación Ordinal: Convierte 'desempeño' (ej. bajo:0, medio:1, alto:2) y 'jerarquia' a números.
            *   Conversión Numérica: 'horas_extra' a entero.
            *   Codificación One-Hot: Transforma la columna 'area' en múltiples columnas binarias (`area_Ventas`, `area_Desarrollo`, etc.) usando `OneHotEncoder`. El encoder se ajusta (fit) con estos datos.
        3.  **Entrenamiento del Modelo**:
            *   Divide los datos en conjuntos de entrenamiento y prueba.
            *   Entrena un modelo `LinearRegression` de `scikit-learn` para predecir `desempeño_futuro`.
            *   Calcula el R² score sobre el conjunto de prueba.
        4.  **Guardado de Artefactos**: Guarda un archivo `.pkl` (ej. `backend-ml/Regresion lineal/modelo_desempeño_futuro.pkl`) que contiene un diccionario con:
            *   `modelo`: El objeto del modelo entrenado.
            *   `columnas`: La lista de nombres de columnas de características usadas para entrenar (importante para la predicción).
            *   `encoder`: El objeto `OneHotEncoder` ajustado.
    *   **Salida (Respuesta HTTP)**: Un JSON como `{"message": "Model trained successfully", "r2_score": 0.85}`.

2.  **Endpoint `/api/ml/regression/predict` (POST)**
    *   **Función**: Predecir el desempeño futuro para nuevos datos usando el modelo entrenado.
    *   **Entrada**: Un archivo CSV enviado como `multipart/form-data` bajo la clave `file`.
        *   **Columnas Esperadas en el CSV de Predicción**: Las mismas que para el entrenamiento, excepto `desempeño_futuro`.
    *   **Proceso (adapta la lógica de `Regresion lineal/predecir_rendimiento_futuro.py`):**
        1.  Guarda el archivo CSV subido.
        2.  **Carga de Artefactos**: Carga el modelo, la lista de columnas y el `OneHotEncoder` desde el archivo `.pkl` guardado en el paso de entrenamiento.
        3.  **Preprocesamiento de Nuevos Datos**: Aplica las mismas transformaciones (ordinal encoding, conversión numérica, y el OneHotEncoder *ya ajustado*) a los datos nuevos. Es crucial usar el mismo encoder y orden de columnas que en el entrenamiento.
        4.  **Predicción**: Utiliza el modelo cargado para generar predicciones sobre los datos preprocesados.
    *   **Salida (Respuesta HTTP)**: Un JSON como `{"predictions": [7.5, 8.2, 6.9, ...]}`.

## 3. Dependencias Generales

Para ejecutar estos servicios de backend, necesitarás:
*   Python 3.x
*   Las siguientes librerías de Python (se pueden instalar vía `pip install -r requirements.txt` si los archivos `requirements.txt` están completos y presentes en las respectivas carpetas, o individualmente con `pip install Flask pandas scikit-learn Flask-CORS openpyxl`):
    *   `Flask`
    *   `Flask-CORS`
    *   `pandas`
    *   `scikit-learn`
    *   `openpyxl` (para leer archivos `.xlsx`)

Asegúrate de que los archivos de datos de entrada (`.xlsx`, `.csv`) estén en las ubicaciones correctas o se proporcionen según lo esperado por los scripts y endpoints.
