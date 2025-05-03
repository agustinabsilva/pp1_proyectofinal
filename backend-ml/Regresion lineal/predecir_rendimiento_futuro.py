import pandas as pd
import pickle

# Define la ruta del archivo donde guardaste el modelo entrenado
modelo_guardado_path = 'backend-ml/Regresion lineal/modelo_desempeño_futuro.pkl'

# Define la ruta del nuevo archivo CSV CON la columna 'desempeño'
nuevo_data_filepath = 'backend-ml/Regresion lineal/nuevos_empleados_sin_prediccion.csv'

try:
    # Carga el modelo entrenado desde el archivo
    with open(modelo_guardado_path, 'rb') as archivo_cargado:
        modelo_cargado = pickle.load(archivo_cargado)

    # Lee el nuevo archivo CSV con los datos de los nuevos empleados
    nuevos_df = pd.read_csv(nuevo_data_filepath, encoding="utf-8")

    # --- Preprocesamiento de los nuevos datos ---
    # Asegúrate de realizar exactamente el mismo preprocesamiento que hiciste con los datos de entrenamiento

    # 1. Eliminar la columna 'nombre' si existe
    if 'nombre' in nuevos_df.columns:
        nuevos_df = nuevos_df.drop('nombre', axis=1)

    # 2. Codificar la columna 'area'
    area_mapping = {'administracion': 0, 'ventas': 1, 'seguridad': 2}
    nuevos_df['area_encoded'] = nuevos_df['area'].map(area_mapping)

    # 3. Asegurar que la columna 'horas_extra' sea numérica
    nuevos_df['horas_extra'] = nuevos_df['horas_extra'].astype(int)

    # 4. Seleccionar las columnas de características (en el mismo orden que se usaron para entrenar)
    # Incluye 'desempeño' en la lista de características
    X_cols_nuevos = ['area_encoded', 'puntaje', 'desempeño', 'cantidad_proyectos',
                     'personas_equipo', 'horas_extra', 'asistencia_puntualidad']
    X_nuevos = nuevos_df[X_cols_nuevos]

    # --- Realizar la predicción ---
    predicciones_futuras = modelo_cargado.predict(X_nuevos)

    # --- Mostrar las predicciones ---
    print("\nPredicciones de desempeño futuro para los nuevos empleados:")
    for i, prediccion in enumerate(predicciones_futuras):
        print(f"Empleado {i+1}: {prediccion:.2f}")

except FileNotFoundError as e:
    print(f"Error: No se encontró el archivo '{e.filename}'. Asegúrate de que las rutas sean correctas.")
except KeyError as e:
    print(f"Error de clave al procesar los datos: La columna '{e}' no se encontró en el archivo.")
except Exception as e:
    print(f"Ocurrió un error: {e}")