document.getElementById('btn-exportar-pdf').addEventListener('click', function() {
    html2canvas(document.querySelector('#reportes-section')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save('dashboard.pdf');
    });
});

document.getElementById('btn-exportar-excel').addEventListener('click', function() {
    // Aquí debes obtener los datos que deseas exportar
    const data = [
        ["Columna 1", "Columna 2", "Columna 3"],
        ["Dato 1", "Dato 2", "Dato 3"],
        // Agrega más filas según sea necesario
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, "dashboard.xlsx");
  });