# REPORTE DE TESTING — Frontend V2 (Local)
## MVP Valle y Co SAS — ClassRoom Pro
### Fecha: 3 de abril de 2026
### Testeado por: Marcela Aristizábal Julio

---

## RESUMEN GENERAL

La plataforma avanzó significativamente. El diseño es profesional, la navegación es intuitiva y la mayoría de los módulos base funcionan correctamente. Los principales problemas están en el flujo de agendamiento (Create Booking) y en la falta de validaciones cruzadas con la disponibilidad del profesor.

| Categoría | Cantidad |
|-----------|----------|
| 🔴 Bugs críticos | 4 |
| 🟡 Mejoras de UX/validaciones | 10 |
| 🟠 Funcionalidades pendientes | 5 |
| ✅ Funciona correctamente | 12 |

---

## ✅ LO QUE FUNCIONA BIEN

### Admin
1. ✅ Login y autenticación — funciona perfecto
2. ✅ Dashboard con estadísticas — muestra usuarios, rooms, bookings pending/completed
3. ✅ Quick Actions (New User, New Room, New Package) — funcionan
4. ✅ User Management — crear, editar, eliminar usuarios con roles
5. ✅ Room Management — crear, editar, eliminar salones con capacidad y toggle activo/inactivo
6. ✅ Package Catalog — crear paquetes con tipo, horas, semanas, precio, descuento
7. ✅ Payments — aprobar/rechazar con razón, filtro por status, notificación de éxito
8. ✅ Room Availability — búsqueda por salón y rango de fechas

### Profesor
9. ✅ Dashboard — resumen de disponibilidad, clases hoy, pending, completed
10. ✅ My Availability — grilla semanal visual con diferenciación Virtual (azul) / In-Person (amarillo)
11. ✅ Configure Availability — seleccionar día, hora inicio/fin, virtual/presencial, agregar/eliminar rangos
12. ✅ Aviso de viernes para configurar disponibilidad

### Estudiante
13. ✅ Dashboard — paquetes activos, bookings pending/completed, próxima clase
14. ✅ Wizard de Book a Class — flujo paso a paso (Class Type → Teacher → Room → Date → Confirm)

### General
15. ✅ Internacionalización español/inglés (botón ES)
16. ✅ Landing page profesional
17. ✅ Diseño consistente y atractivo
18. ✅ Permisos por rol funcionan (cada rol ve solo lo que le corresponde)

---

## 🔴 BUGS CRÍTICOS — No funciona, hay que arreglar

### BUG-001: Create Booking da error tanto desde admin como desde estudiante
- **Dónde:** Book a Class → Confirm Booking → "Error creating booking"
- **Reproducción:** Completar todo el wizard (tipo, profesor, salón, fecha, hora) y darle Create Booking
- **Afecta a:** Admin Y Estudiante — ninguno puede crear bookings
- **Impacto:** CRÍTICO — sin esto el sistema no cumple su función principal
- **Endpoint:** `POST /api/bookings`
- **Nota:** Desde admin debería estar bloqueado (solo estudiantes crean bookings). Desde estudiante debería funcionar.

### BUG-002: Cancel booking da error desde la vista del profesor
- **Dónde:** My Classes → Booking Details → Cancel
- **Reproducción:** Abrir detalle de un booking y darle Cancel
- **Error:** "Error al realizar el proceso"
- **Posible causa:** Los bookings no tienen profesor asignado (Teacher muestra "–"), por lo tanto la API rechaza la cancelación porque la regla dice "only the assigned teacher can cancel"
- **Endpoint:** `DELETE /api/bookings/{booking_id}`

### BUG-003: Confirm booking da error desde el admin
- **Dónde:** Bookings → Booking Details → Confirm
- **Reproducción:** Abrir un booking pending y darle Confirm
- **Error:** Error de procesamiento
- **Posible causa:** Mismo problema que BUG-002 — los bookings no tienen teacher asignado
- **Endpoint:** `POST /api/bookings/{booking_id}/confirm`

### BUG-004: View Receipt lleva a página 404
- **Dónde:** Payments → View receipt (link)
- **Reproducción:** Dar clic en "View receipt" en cualquier pago
- **Error:** 404 — Página no encontrada
- **Nota:** Es uno de los fallos de rutas que Paul mencionó

---

## 🟡 MEJORAS DE UX Y VALIDACIONES — Funciona pero necesita ajustes

### UX-001: Wizard de agendamiento no muestra disponibilidad real del profesor
- **Dónde:** Book a Class → Date & Time
- **Problema:** Permite seleccionar cualquier fecha y hora. Debería mostrar SOLO los horarios que el profesor seleccionado tiene disponibles.
- **Solución esperada:** Al seleccionar un profesor en el paso 2, el paso de Date & Time debería cargar automáticamente los slots disponibles de ese profesor y permitir escoger solo entre ellos.

### UX-002: Wizard no valida disponibilidad de salón para clases presenciales
- **Dónde:** Book a Class → Select Room
- **Problema:** Muestra todos los salones sin verificar si están libres en la fecha/hora seleccionada.
- **Solución esperada:** Solo mostrar salones disponibles para el horario escogido.

### UX-003: Falta validación de regla de 24 horas
- **Dónde:** Book a Class → Date & Time
- **Problema:** Permite seleccionar fechas/horas que son menos de 24h en el futuro.
- **Solución esperada:** Bloquear o deshabilitar fechas que sean menos de 24h desde el momento actual.

### UX-004: Formato de fecha en mm/dd/yyyy — debería ser dd/mm/yyyy
- **Dónde:** Book a Class → Date & Time
- **Problema:** Formato estadounidense, los usuarios colombianos usan dd/mm/yyyy.

### UX-005: Horarios en formato UTC
- **Dónde:** Bookings, Dashboard, My Classes
- **Problema:** Las horas aparecen como "13:00:00Z" en vez de "8:00 AM" (hora Colombia, UTC-5).
- **Solución:** Convertir a zona horaria local (America/Bogota).

### UX-006: Textos de estadísticas cortados en dashboards
- **Dónde:** Admin Dashboard, Teacher Dashboard
- **Problema:** "Total Us...", "Active R...", "Pending Bookin...", "Completed Boo..."
- **Solución:** Usar textos más cortos o hacer las tarjetas más anchas.

### UX-007: Bookings no muestran nombre del estudiante ni del profesor
- **Dónde:** Booking Management (admin), My Classes (profesor), Booking Details (todos)
- **Problema:** Teacher muestra "–", no se identifica qué estudiante agendó.
- **Solución:** Mostrar nombre completo del estudiante y del profesor en vez de IDs o guiones.

### UX-008: Precios en formato dólar — debería ser COP
- **Dónde:** Package Catalog, Payments
- **Problema:** Muestra "$100.00", "$4,800.00" en vez de formato colombiano "$395.900 COP".
- **Solución:** Configurar formato de moneda local (COP sin decimales).

### UX-009: Admin puede borrar al Super Admin
- **Dónde:** Users → Super Admin → botón de eliminar
- **Problema:** Mala práctica de seguridad. El admin no debería poder eliminar al super_admin.
- **Solución:** Ocultar botón de eliminar para usuarios con rol superior o igual.

### UX-010: "Reviewed By: 11" muestra ID numérico en vez de nombre
- **Dónde:** Payments → pagos confirmados
- **Problema:** Dice "Reviewed By: 11" en vez de "Reviewed By: Super Admin".
- **Solución:** Resolver el ID del reviewer a su nombre completo.

---

## 🟠 FUNCIONALIDADES PENDIENTES

### PEND-001: Enlace de videollamada (meeting_url)
- **Dónde debería estar:** Booking Details (profesor y estudiante)
- **Qué falta:** Campo para que el admin registre el link de Zoom/Meet, y que sea visible para el profesor y estudiante cuando la clase es virtual.

### PEND-002: Horas restantes del estudiante
- **Dónde debería estar:** Student Dashboard, My Packages
- **Qué falta:** Mostrar horas totales, usadas y restantes por paquete activo. El dashboard anterior mostraba "HORAS RESTANTES" pero sin datos.

### PEND-003: Alertas de créditos
- **Qué falta:** Notificación al admin cuando un estudiante está por agotar sus horas. Badge en dashboard + email.

### PEND-004: Notificaciones por email (SMTP)
- **Qué falta:** Emails de confirmación al agendar, al aprobar/rechazar pagos, alertas de créditos.

### PEND-005: Endpoint para marcar clase como completada
- **Qué falta:** Botón o acción para que el admin/profesor marque una clase como terminada. Sin esto no se pueden calcular horas usadas.

---

## PREGUNTAS PARA PAUL

1. **Create Booking:** ¿El endpoint `POST /api/bookings` ya funciona? Desde el frontend da error tanto como admin como estudiante. ¿Puedes revisar los logs?

2. **Teacher no asignado:** Todos los bookings muestran Teacher "–". ¿Los bookings se están creando sin teacher_id? Eso causa que no se pueda confirmar ni cancelar.

3. **Cancelación:** ¿El admin y el estudiante deberían poder cancelar bookings? Actualmente solo el profesor asignado puede, y como no hay profesor asignado, nadie puede cancelar.

4. **Disponibilidad en el wizard:** ¿Está planificado que el paso de Date & Time del wizard muestre solo los horarios disponibles del profesor seleccionado? Actualmente permite cualquier fecha/hora.

5. **View Receipt 404:** ¿Es uno de los fallos de rutas que mencionaste? ¿Cómo se va a manejar la visualización del comprobante?

---

## PRIORIDADES SUGERIDAS

### Semana 1 (inmediato)
1. 🔴 Arreglar Create Booking (BUG-001) — sin esto no se puede probar nada más
2. 🔴 Arreglar asignación de teacher a bookings — causa BUG-002 y BUG-003
3. 🔴 Arreglar View Receipt 404 (BUG-004)

### Semana 2
4. 🟡 Wizard de agendamiento muestre solo horarios disponibles del profesor (UX-001)
5. 🟡 Mostrar nombre de estudiante y profesor en bookings (UX-007)
6. 🟡 Validación de 24h de anticipación (UX-003)
7. 🟡 Formato de hora Colombia (UX-005)

### Semana 3
8. 🟡 Formato de moneda COP (UX-008)
9. 🟡 Formato de fecha dd/mm/yyyy (UX-004)
10. 🟡 Seguridad: admin no puede borrar super_admin (UX-009)
11. 🟠 Enlace de videollamada (PEND-001)

### Antes de entrega
12. 🟠 Horas restantes y alertas de créditos (PEND-002, PEND-003)
13. 🟠 Emails de confirmación (PEND-004)
14. 🟠 Marcar clase como completada (PEND-005)
