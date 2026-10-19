import re 
 
with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f: 
    content = f.read() 
 
# Buscar y reemplazar el bloque de botones viejos 
replacement = '''{/* Dashboard horizontal con tabs */} 
  pet={pet} 
  onVerPerfil={() =, '_blank')} 
  onVerQR={() =
  onEditar={() =
  onVerUbicacion={() =
  onVerHistorial={() =
  onVacunas={() =
  onVeterinario={() =
  onAlergias={() =
  onMedicacion={() =
  onHistorialMedico={() =
  onDesparasitaciones={() =
  onControlPeso={() =
  onCentroAlertas={() =
  onDiarioVida={() =
  onReportarPerdido={() =
  onEliminar={() =
/
 
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL) 
 
with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f: 
    f.write(new_content) 
 
print('Listo! Botones viejos reemplazados.') 
