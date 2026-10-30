# Directorio de socios

Un archivo `.md` por socio que haya **autorizado por escrito** figurar en el directorio público
de `/socios/`. El nombre del archivo no se muestra (ej. `perez-juan.md`). Este archivo empieza con
`_`, así que el sitio lo ignora.

```markdown
---
nombre: "Ing. Juan Pérez"
categoria: adherente
especialidad: "Transmisión"
consentimiento: true
---
```

| Campo            | Obligatorio | Valores |
|------------------|-------------|---------|
| `nombre`         | Sí          | Como debe figurar (con título profesional). |
| `categoria`      | Sí          | `fundador`, `adherente`, `emerito` o `colectivo` (Estatutos, art. 18). |
| `especialidad`   | Sí          | Área: Generación, Transmisión, Distribución, Planificación, Regulación, Economía energética… El directorio se agrupa por este campo. |
| `consentimiento` | Sí          | Debe ser `true`: confirma que el socio autorizó la publicación. Sin esto, el archivo no se acepta. |

Mientras no haya ningún socio cargado, la página muestra solo los requisitos y el proceso de ingreso.
