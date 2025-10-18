# 🔄 Workflow de Cambios en Backend

## ⚠️ REGLA IMPORTANTE

**TODO cambio del backend debe ser hecho localmente y desplegado con `git push live main:master`**

### ¿Por qué?

1. **Trazabilidad**: Git mantiene historial completo de cambios
2. **Rollback**: Podemos revertir cambios si algo sale mal
3. **Documentación**: Los commits documentan qué cambió y por qué
4. **Colaboración**: Otros desarrolladores pueden ver los cambios
5. **Backup**: El código está en múltiples lugares (local, origin, servidor)

---

## ✅ Workflow Correcto

### 1. Hacer cambios localmente

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4

# Editar archivos
nano app/Config/Routes.php
# o usar tu editor preferido
```

### 2. Commit de cambios

```bash
git add archivo-modificado.php
git commit -m "descripción del cambio"
```

### 3. Push a origin (GitHub)

```bash
git push origin main
```

### 4. Deploy a producción

```bash
git push live main:master
```

El servidor automáticamente:
- ✅ Ejecuta `composer install`
- ✅ Ajusta permisos
- ✅ Limpia caché
- ✅ Deploy completado

---

## ❌ Workflow Incorrecto (NO HACER)

```bash
# ❌ NUNCA hacer cambios directamente en el servidor
ssh usuario@servidor
sudo nano /var/www/api2.mitienda.pe/app/Config/Routes.php

# Problemas:
# - No hay commit
# - No hay historial
# - Se pierde en el próximo deploy
# - No se puede revertir fácilmente
# - Otros devs no saben del cambio
```

---

## 🔧 Si ya hiciste un cambio manual en el servidor

### Paso 1: Revertir el cambio manual

```bash
# Si hiciste backup
ssh usuario@servidor
sudo cp /ruta/archivo.php.backup /ruta/archivo.php

# O simplemente deshaz el cambio manual
```

### Paso 2: Hacer el cambio localmente

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4
# Editar el archivo localmente
git add archivo.php
git commit -m "descripción"
```

### Paso 3: Desplegar correctamente

```bash
git push origin main
git push live main:master
```

---

## 📋 Checklist para Cambios en Backend

- [ ] Cambio hecho localmente (no en el servidor)
- [ ] Código probado localmente si es posible
- [ ] Commit con mensaje descriptivo
- [ ] Push a `origin main` (GitHub)
- [ ] Push a `live main:master` (Producción)
- [ ] Verificar que el deploy fue exitoso
- [ ] Probar en producción

---

## 🎯 Ejemplo Real: Agregar Ruta POS

### ❌ Lo que NO se debe hacer:

```bash
ssh ubuntu@servidor
sudo nano /var/www/api2.mitienda.pe/app/Config/Routes.php
# Agregar línea manualmente
sudo rm -rf writable/cache/*
```

### ✅ Lo que SÍ se debe hacer:

```bash
# Local
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4
nano app/Config/Routes.php
# Agregar: $routes->post('orders/pos', 'Order::createFromPOS');

git add app/Config/Routes.php
git commit -m "feat: Add POS orders endpoint route"
git push origin main
git push live main:master
```

---

## 🚨 Casos de Emergencia

Si hay un problema urgente en producción:

### Opción 1: Hotfix rápido (preferido)

```bash
# Local
git checkout -b hotfix/nombre-del-fix
# Hacer el cambio
git add .
git commit -m "hotfix: descripción"
git push origin hotfix/nombre-del-fix
git checkout main
git merge hotfix/nombre-del-fix
git push live main:master
```

### Opción 2: Rollback

```bash
cd /Users/carlosvidal/www/mitienda/mitienda-api-ci4
git log --oneline -10  # Ver últimos commits
git revert <commit-hash>  # Revertir commit problemático
git push origin main
git push live main:master
```

---

## 📝 Lección Aprendida

**Fecha**: 2025-10-18

**Situación**: Se agregó la ruta `orders/pos` directamente en el servidor editando `Routes.php` manualmente.

**Problema**:
- No había commit del cambio
- No había trazabilidad
- No se podía revertir fácilmente

**Solución aplicada**:
1. Revertir el cambio manual con el backup
2. Hacer el cambio localmente en `app/Config/Routes.php`
3. Commit: `1e85e22` - "feat: Add POS orders endpoint route"
4. Deploy con `git push live main:master`

**Resultado**: ✅ Cambio desplegado correctamente con trazabilidad completa

---

## 🔗 Comandos Útiles

```bash
# Ver estado del repo
git status

# Ver últimos commits
git log --oneline -10

# Ver diferencias antes de commitear
git diff

# Ver qué hay en el servidor vs local
git log origin/main..main

# Verificar deploy en el servidor
ssh usuario@servidor "cd /var/www/api2.mitienda.pe && git log --oneline -5"
```

---

## ✅ Resumen

1. **SIEMPRE** hacer cambios localmente
2. **SIEMPRE** commitear con mensajes descriptivos
3. **SIEMPRE** push a origin primero
4. **SIEMPRE** desplegar con `git push live main:master`
5. **NUNCA** editar archivos directamente en el servidor

**Tu regla es correcta y debe seguirse estrictamente.** 🎯
