import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import pickle

filepath = 'backend-ml/Regresion lineal/tu_archivo_con_puntaje.csv'
modelo_guardado_path = 'backend-ml/Regresion lineal/modelo_desempeño_futuro.pkl'

try:
    df = pd.read_csv(filepath, encoding="utf-8")

    if 'nombre' in df.columns:
        df = df.drop('nombre', axis=1)

    area_mapping = {'administracion': 0, 'ventas': 1, 'seguridad': 2}
    df['area_encoded'] = df['area'].map(area_mapping)

    # Modifica X_cols para incluir 'desempeño'
    X_cols = ['area_encoded', 'puntaje', 'desempeño', 'cantidad_proyectos',
              'personas_equipo', 'horas_extra', 'asistencia_puntualidad']
    y_col = "desempeño_futuro"

    if all(col in df.columns for col in X_cols) and y_col in df.columns and 'area_encoded' in df.columns:
        X = df[X_cols].copy()
        y = df[y_col].copy()

        X['horas_extra'] = X['horas_extra'].astype(int)

        x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

        model = LinearRegression()
        model.fit(x_train, y_train)

        y_train_pred = model.predict(x_train)
        y_test_pred = model.predict(x_test)

        mse_train = mean_squared_error(y_train, y_train_pred)
        mse_test = mean_squared_error(y_test, y_test_pred)

        r2_train = r2_score(y_train, y_train_pred)
        r2_test = r2_score(y_test, y_test_pred)

        print("\nModelo de regresión lineal entrenado.")
        print(f"MSE en el conjunto de entrenamiento: {mse_train:.2f}")
        print(f"MSE en el conjunto de prueba: {mse_test:.2f}")
        print(f"R^2 en el conjunto de entrenamiento: {r2_train:.2f}")
        print(f"R^2 en el conjunto de prueba: {r2_test:.2f}")

        with open(modelo_guardado_path, 'wb') as archivo:
            pickle.dump(model, archivo)
        print(f"\nModelo entrenado guardado en: {modelo_guardado_path}")

        with open(modelo_guardado_path, 'rb') as archivo_cargado:
            modelo_cargado = pickle.load(archivo_cargado)

        # Asegúrate de que el DataFrame de nuevos empleados también incluya la columna 'desempeño'
        nuevos_empleados = pd.DataFrame({
            'area': ['ventas', 'administracion'],
            'puntaje': [90, 75],
            'desempeño': [85, 70],  # Agrega la columna 'desempeño'
            'cantidad_proyectos': [3, 2],
            'personas_equipo': [6, 4],
            'horas_extra': [False, True],
            'asistencia_puntualidad': [95, 80]
        })

        nuevos_empleados['area_encoded'] = nuevos_empleados['area'].map(area_mapping)
        nuevos_empleados['horas_extra'] = nuevos_empleados['horas_extra'].astype(int)
        X_nuevos = nuevos_empleados[X_cols]

        predicciones_futuras = modelo_cargado.predict(X_nuevos)
        print("\nPredicciones de desempeño futuro para nuevos empleados:")
        print(predicciones_futuras)

    else:
        print("Error: No se encontraron todas las columnas necesarias en el archivo.")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo '{filepath}'.")
except KeyError as e:
    print(f"Error de clave al cargar datos: {e}")
    df = None