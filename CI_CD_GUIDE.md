# Guía de CI/CD para agentes

Este documento describe el despliegue de la web estática de VALNATIR. La fuente
de verdad ejecutable es [`.gitlab-ci.yml`](.gitlab-ci.yml). Antes de modificar
el pipeline, contrasta esta guía con dicho archivo.

## Arquitectura y entornos

- GitLab CI ejecuta el pipeline.
- Amazon S3 almacena la web estática.
- Amazon CloudFront sirve el contenido e invalida su caché tras cada despliegue.
- La rama `dev` despliega automáticamente al entorno GitLab `preproduction`.
- La rama `main` despliega automáticamente al entorno GitLab `production`.
- Los buckets y las distribuciones CloudFront ya existen; el pipeline no
  provisiona infraestructura AWS.

## Flujo del pipeline

El pipeline contiene dos etapas:

1. `prepare`: `prepare_site` crea el artefacto `dist/`.
2. `deploy`: `deploy_dev` o `deploy_prod` sincroniza el artefacto con AWS.

`prepare_site` solo se ejecuta para `dev` y `main`. Publica exclusivamente:

- Los archivos `*.html` de la raíz.
- `app.js`, `styles.css` y `sitemap.xml`.
- Los directorios `assets/` y `es/`.

No deben publicarse README, documentación, CSV, configuración Git ni otros
archivos internos. Si se añade un nuevo archivo o directorio público, hay que
incluirlo explícitamente en `prepare_site`.

Los jobs de despliegue heredan de la plantilla oculta `.deploy`:

- `deploy_dev` solo se ejecuta en `dev`.
- `deploy_prod` solo se ejecuta en `main`.
- `aws s3 sync --delete` mantiene S3 idéntico a `dist/` y elimina archivos
  obsoletos.
- Los recursos reciben una caché de 24 horas.
- HTML, XML, CSS y JavaScript se sobrescriben con `no-cache`.
- Al terminar se crea una invalidación CloudFront para `/*`.

## Variables de GitLab

Las variables se configuran en **Settings → CI/CD → Variables** y nunca deben
guardarse en el repositorio:

- `AWS_ACCESS_KEY_ID`: access key del usuario IAM de despliegue.
- `AWS_SECRET_ACCESS_KEY`: secret access key del usuario IAM.
- `AWS_DEFAULT_REGION`: región de los buckets S3.
- `S3_DEV_BUCKET`: nombre del bucket de preproducción, sin `s3://`.
- `S3_PROD_BUCKET`: nombre del bucket de producción, sin `s3://`.
- `CLOUDFRONT_DEV_DISTRIBUTION_ID`: ID de CloudFront de preproducción.
- `CLOUDFRONT_PROD_DISTRIBUTION_ID`: ID de CloudFront de producción.
- `DEV_URL`: URL HTTPS de CloudFront de preproducción.
- `PROD_URL`: URL HTTPS de CloudFront de producción.

Las credenciales AWS deben ser `Masked` o `Masked and hidden`, y `Protected`.
Las demás variables de despliegue también deben ser `Protected`. Las ramas
`dev` y `main` deben estar protegidas para poder recibir estas variables.

No mostrar secretos en logs, documentación, commits, capturas ni respuestas.
Si una credencial se expone, revocarla y rotarla inmediatamente.

## Permisos y runner

El usuario IAM debe limitarse a:

- Listar ambos buckets.
- Leer, crear y eliminar objetos de ambos buckets.
- Crear invalidaciones únicamente en las dos distribuciones CloudFront.

No usar credenciales del usuario root de AWS.

El GitLab Runner debe estar activo, aceptar jobs sin etiquetas y poder ejecutar
las imágenes Docker declaradas por el pipeline. El job de despliegue utiliza
la versión fijada de `amazon/aws-cli`; no cambiarla por una etiqueta inexistente
o no verificada.

## Cambios seguros

Al modificar el pipeline:

1. Mantener separadas las variables y reglas de `dev` y `main`.
2. No convertir el despliegue de producción en un job ejecutable desde otras
   ramas.
3. Mantener el artefacto como lista permitida; no sincronizar la raíz completa
   del repositorio.
4. Conservar `--delete` para evitar contenido antiguo en S3.
5. Revisar la estrategia de caché si cambian los nombres o el versionado de
   CSS, JavaScript o recursos.
6. Validar el YAML y probar primero mediante `dev`.
7. Verificar la URL de preproducción antes de fusionar a `main`.

## Diagnóstico

- Job en `pending`: comprobar que hay un runner activo y que acepta jobs sin
  etiquetas.
- Variable ausente: comprobar su nombre exacto y que `dev`/`main` estén
  protegidas si la variable es `Protected`.
- `AccessDenied` en S3: revisar bucket, cuenta y permisos IAM de bucket/objetos.
- `AccessDenied` en CloudFront: permitir `cloudfront:CreateInvalidation` para
  la distribución correcta.
- Web desactualizada: revisar que el job creó la invalidación y comprobar las
  cabeceras de caché.
- Archivo ausente: confirmar que `prepare_site` lo copia a `dist/`.
- Archivo interno publicado: retirarlo de S3 y corregir inmediatamente la lista
  permitida de `prepare_site`.

## Verificación mínima

Antes de aceptar cambios de CI/CD, comprobar:

- El YAML es válido.
- `dev` solo activa `prepare_site` y `deploy_dev`.
- `main` solo activa `prepare_site` y `deploy_prod`.
- `dist/` no contiene documentación, CSV ni secretos.
- Las credenciales no aparecen en la salida del pipeline.
- El despliegue de `dev` finaliza correctamente y la URL de preproducción carga.
