import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import OneHotEncoder
import pickle

filepath = 'backend-ml/Regresion lineal/DataSet_entrenamiento.csv'
modelo_guardado_path = 'backend-ml/Regresion lineal/modelo_desempeño_futuro.pkl'

try:
    df = pd.read_csv(filepath, encoding="utf-8")

    #como desempeño tiene orden logico uso codificacion manual para que el modelo entienda que alto>medio>bajo
    orden_desempeño = {'bajo': 0, 'medio': 1, 'alto': 2}
    df['desempeño_ordinal'] = df['desempeño'].map(orden_desempeño)
    #lo mismo con jerarquia
    orden_jerarquia = {'trainee': 0, 'junior': 1, 'senior': 2}
    df['jerarquia_ordinal'] = df['jerarquia'].map(orden_jerarquia)
    #uso astype para la columna binaria, TRUE y FALSE
    df['horas_extra'] = df['horas_extra'].astype(int)
    #uso one hot encoder para convertir lo datos categoricos en numeros
    ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    area_encoded = ohe.fit_transform(df[['area']])
    area_encoded_df = pd.DataFrame(area_encoded, columns=ohe.get_feature_names_out(['area']), index=df.index)

    df_final = pd.concat([df.drop(
        ['area', 'jerarquia', 'desempeño'], axis=1), area_encoded_df],
        axis=1)

    x = df_final.drop(['nombre', 'desempeño_futuro'], axis=1) #caracteristicas
    y = df_final['desempeño_futuro'] #objetico
    #divido conjunto de entrenamiento 70% y prueba 30%
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=1)

    model = LinearRegression()
    model.fit(x_train, y_train)

    #guardo el modelo y el orden de las columnas
    modelo_y_columnas = {'modelo': model, 'columnas': list(x.columns), 'encoder': ohe}

    #prediccion en el conjunto de prueba
    y_pred = model.predict(x_test)
    #metricas de precisio
    r2_test = r2_score(y_test, y_pred)
    print(f"r2: {r2_test*100:.2f}%")  
    

    with open(modelo_guardado_path, 'wb') as archivo:
        pickle.dump(modelo_y_columnas, archivo)
    print(f"\nModelo entrenado guardado en: {modelo_guardado_path}")
except Exception as e:
    print(f"Error durante el preprocesamiento: {e}")
    #if 'nombre' in df.columns:
    #    df = df.drop('nombre', axis=1)

    #area_mapping = {'administracion': 0, 'ventas': 1, 'seguridad': 2}
    #df['area_encoded'] = df['area'].map(area_mapping)

    #area_mapping = {'junior': 0, 'trainee': 1, 'senior': 2} 

    # Modifica X_cols para incluir 'desempeño'
    #X_cols = ['area_encoded', 'puntaje', 'desempeño', 'cantidad_proyectos',
     #         'personas_equipo', 'horas_extra', 'asistencia_puntualidad']
    #y_col = "desempeño_futuro"

    #if all(col in df.columns for col in X_cols) and y_col in df.columns and 'area_encoded' in df.columns:
    #    X = df[X_cols].copy()
    #    y = df[y_col].copy()

    #    X['horas_extra'] = X['horas_extra'].astype(int)

    #   x_train, x_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

    #    model = LinearRegression()
    #    model.fit(x_train, y_train)

    #    y_train_pred = model.predict(x_train)
    #    y_test_pred = model.predict(x_test)

    #    mse_train = mean_squared_error(y_train, y_train_pred)
    #    mse_test = mean_squared_error(y_test, y_test_pred)

    #    r2_train = r2_score(y_train, y_train_pred)
    #    r2_test = r2_score(y_test, y_test_pred)

    #    print("\nModelo de regresión lineal entrenado.")
    #    print(f"MSE en el conjunto de entrenamiento: {mse_train:.2f}")
    #    print(f"MSE en el conjunto de prueba: {mse_test:.2f}")
    #    print(f"R^2 en el conjunto de entrenamiento: {r2_train:.2f}")
    #    print(f"R^2 en el conjunto de prueba: {r2_test:.2f}")

    #    with open(modelo_guardado_path, 'wb') as archivo:
    #        pickle.dump(model, archivo)
    #    print(f"\nModelo entrenado guardado en: {modelo_guardado_path}")

    #    with open(modelo_guardado_path, 'rb') as archivo_cargado:
    #        modelo_cargado = pickle.load(archivo_cargado)

        # Asegúrate de que el DataFrame de nuevos empleados también incluya la columna 'desempeño'
    #    nuevos_empleados = pd.DataFrame({
    #        'area': ['ventas', 'administracion'],
    #        'puntaje': [90, 75],
    #        'desempeño': [85, 70],  # Agrega la columna 'desempeño'
    #        'cantidad_proyectos': [3, 2],
    #        'personas_equipo': [6, 4],
    #        'horas_extra': [False, True],
    #        'asistencia_puntualidad': [95, 80]
    #    })

    #    nuevos_empleados['area_encoded'] = nuevos_empleados['area'].map(area_mapping)
    #    nuevos_empleados['horas_extra'] = nuevos_empleados['horas_extra'].astype(int)
    #    X_nuevos = nuevos_empleados[X_cols]

    #    predicciones_futuras = modelo_cargado.predict(X_nuevos)
    #    print("\nPredicciones de desempeño futuro para nuevos empleados:")
    #    print(predicciones_futuras)

    #else:
    #    print("Error: No se encontraron todas las columnas necesarias en el archivo.")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo '{filepath}'.")
except KeyError as e:
    print(f"Error de clave al cargar datos: {e}")
    df = None