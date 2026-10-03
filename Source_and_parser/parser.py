import json
import re
import os

def procesar_archivos():
    archivo_json_plantilla = 'template.json'
    archivo_texto_fuente = 'source.txt'
    archivo_json_salida = 'filled_paths.json'

    # Verificar existencia de archivos en la misma carpeta
    if not os.path.exists(archivo_json_plantilla):
        print(f"Error: No se encontró el archivo '{archivo_json_plantilla}' en esta carpeta.")
        return
    if not os.path.exists(archivo_texto_fuente):
        print(f"Error: No se encontró el archivo '{archivo_texto_fuente}' en esta carpeta.")
        return

    print("Leyendo archivos de entrada (UTF-8)...")
    
    with open(archivo_json_plantilla, 'r', encoding='utf-8') as f:
        data = json.load(f)

    with open(archivo_texto_fuente, 'r', encoding='utf-8') as f:
        source_text = f.read()

    print("Procesando tablas de la Wiki...")

    # Separar el texto por cada Path individual (=== Path X ===)
    path_sections = re.split(r'===\s*Path\s*(\d+)\s*===', source_text)

    parsed_paths = {}

    # Capturar el bloque de cada Rebirth completo
    row_pattern = re.compile(r'\|\s*(\d+\s*>\s*\d+)\s*\n\|\s*\n([\s\S]*?)(?=\n\|)', re.MULTILINE)
    
    # Expresión regular precisa para capturar la variante, el droid y ver si tiene superíndice al final de la línea
    droid_pattern = re.compile(r'\*\s*(?:{{\s*Variant\s*\|\s*([^}]*)}})?\s*\[\[([^\]]+)\]\]([¹²³⁴⁵⁶⁷⁻]?)')

    for i in range(1, len(path_sections), 2):
        path_num = path_sections[i]
        path_content = path_sections[i+1]
        
        bots_per_rebirth = []
        bots_without_superindex_path = []
        registrados_sin_superindex = set() # Para evitar duplicados exactos en la lista global del Path
        
        # Encontrar todas las filas de renacimientos
        rows = row_pattern.findall(path_content)
        
        for rebirth_str, droids_block in rows:
            rebirth_str = rebirth_str.strip()
            bots_list = []
            
            # Extraer droids inspeccionando si tienen o no superíndice al final
            droids = droid_pattern.findall(droids_block)
            for variant, droid_type, superindex in droids:
                variant = variant.strip() if variant else "Base"
                if variant == "":
                    variant = "Base"
                
                droid_type = droid_type.strip()
                has_superindex = bool(superindex.strip())
                
                bot_obj = {"variant": variant, "type": droid_type}
                bots_list.append(bot_obj)
                
                # REGLA CORREGIDA: Si NO tiene superíndice, clasifica para 'bots_without_superindex'
                if not has_superindex:
                    identificador_unico = (variant, droid_type)
                    if identificador_unico not in registrados_sin_superindex:
                        registrados_sin_superindex.add(identificador_unico)
                        bots_without_superindex_path.append(bot_obj)
                        
            if bots_list:
                bots_per_rebirth.append({
                    "Rebirth": rebirth_str,
                    "bots": bots_list
                })
                
        parsed_paths[path_num] = {
            "Path number": path_num,
            "bots_per_rebirth": bots_per_rebirth,
            "bots_without_superindex": bots_without_superindex_path
        }

    # Reemplazar la estructura original manteniendo el orden de los Paths (1 a 5)
    data["Paths"] = [parsed_paths[str(p)] for p in range(1, 6) if str(p) in parsed_paths]

    # Guardar el JSON final formateado correctamente en UTF-8
    with open(archivo_json_salida, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"¡Hecho! Archivo completo generado como '{archivo_json_salida}'.")

if __name__ == "__main__":
    procesar_archivos()
