async function obtenerToken() {
    try {
        const response = await fetch('http://localhost:5000/metabase-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'ceciliactorales@gmail.com', password: 'AINABI2025' })
        });
        const data = await response.json();
        if (data.token) {
            return data.token;
        } else {
            console.error('Token no recibido');
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

obtenerToken().then(token => {
    if (token) {
        fetch('http://localhost:5000/metabase-dashboard/1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Metabase-Session': token
            }
        })
        .then(response => response.json())
        .then(dashboardData => {
            console.log('Dashboard Data:', dashboardData);
            // Aquí puedes procesar los datos del dashboard como desees
        })
        .catch(error => console.error('Error al obtener el dashboard:', error));
    } else {
        console.error('Token no recibido');
    }
});


/*
obtenerToken().then(token => {
    if (token) {
        fetch('http://localhost:5000/metabase-dashboard/6', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Metabase-Session': token
            }
        })
        .then(response => response.json())
        .then(dashboardData => {
            console.log(dashboardData); // Verifica la estructura de los datos
        })
        .catch(error => console.error('Error al obtener el dashboard:', error));
    } else {
        console.error('Token no recibido');
    }
});*/


