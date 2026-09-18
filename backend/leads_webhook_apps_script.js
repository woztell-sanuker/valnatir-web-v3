/**
 * ==============================================================================
 * VALNATIR · Endpoint de Captación de Leads y Registro de Consentimiento RGPD
 * Google Apps Script / Webhook Server-Side Processing
 * ==============================================================================
 * 
 * Cumplimiento normativo:
 * - RGPD (UE 2016/679) Art. 6.1 (Bases de legitimación) y Art. 7.1 (Demostrabilidad del consentimiento).
 * - LOPDGDD 3/2018 y LSSI-CE 34/2002.
 * - Validación obligatoria en servidor (rechazo de leads sin consentimiento expreso).
 * 
 * Instrucciones de despliegue:
 * 1. Crear una hoja de cálculo en Google Sheets (ej. "VALNATIR · Leads & Trazabilidad RGPD").
 * 2. Ir a Extensiones > Apps Script.
 * 3. Pegar este código.
 * 4. Desplegar > Nueva implementación > Tipo: Aplicación web.
 *    - Ejecutar como: Yo (cuenta titular de la organización con DPA).
 *    - Quién tiene acceso: Cualquier usuario (público / anónimo para recibir envíos web).
 * 5. Copiar la URL generada y asignarla en app.js como LEADS_WEBHOOK_URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawContents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = {};
    try {
      data = JSON.parse(rawContents);
    } catch (err) {
      data = (e && e.parameter) ? e.parameter : {};
    }

    // 1. VALIDACIÓN EN SERVIDOR DEL CONSENTIMIENTO OBLIGATORIO (RGPD Art. 7.1)
    var consentGiven = data.consent === true || data.consent === "true" || data.consent === "1" || data.consent === "on";
    if (!consentGiven) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "Consentimiento no otorgado. La solicitud requiere la aceptación explícita de la Política de Privacidad.",
          code: "CONSENT_REQUIRED"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. VALIDACIÓN DE CAMPOS MÍNIMOS
    var email = (data.email || "").toString().trim();
    var name = (data.name || "").toString().trim();
    var company = (data.company || "").toString().trim();

    if (!email || email.indexOf("@") === -1 || !name) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: "Datos de contacto incompletos.",
          code: "INVALID_FIELDS"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. REGISTRO DE EVIDENCIA Y TRAZABILIDAD (AUDIT TRAIL RGPD)
    var now = new Date();
    var timestampIso = now.toISOString();
    var clientIp = (e && e.headers && (e.headers["CF-Connecting-IP"] || e.headers["X-Forwarded-For"])) || "Capturada en gateway / Headers";
    var consentVersion = data.consent_text_version || "2026-09-18-v1";
    var pageUrl = data.page_url || "https://valnatir.com/";
    var lang = data.lang || "es";
    var sector = data.sector || "-";
    var useCase = data.case || "-";
    var userAgent = data.user_agent || (e && e.headers && e.headers["User-Agent"]) || "-";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads_RGPD") || ss.getActiveSheet();

    // Cabeceras automáticas si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      var headers = [
        "ID Solicitud",
        "Timestamp ISO",
        "Fecha / Hora Local",
        "Nombre y Apellidos",
        "Email Corporativo",
        "Empresa / Organización",
        "Sector Regulado",
        "Caso de Uso",
        "Consentimiento RGPD",
        "Versión Texto Legal",
        "URL de Procedencia",
        "Idioma",
        "IP / Gateway",
        "User Agent"
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#185359");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var leadId = "LEAD-" + now.getTime();
    var row = [
      leadId,
      timestampIso,
      Utilities.formatDate(now, "Europe/Madrid", "yyyy-MM-dd HH:mm:ss"),
      name,
      email,
      company,
      sector,
      useCase,
      "OTORGADO (Aceptado explícitamente)",
      consentVersion,
      pageUrl,
      lang,
      clientIp,
      userAgent
    ];

    sheet.appendRow(row);

    // 4. NOTIFICACIÓN A BUZONES OFICIALES (info@valnatir.com)
    try {
      var subject = "[VALNATIR] Nueva Solicitud de Sandbox / Contacto: " + company + " (" + name + ")";
      var body = "Se ha recibido una nueva solicitud de contacto a través de valnatir.com:\n\n" +
                 "ID: " + leadId + "\n" +
                 "Fecha: " + timestampIso + "\n" +
                 "Nombre: " + name + "\n" +
                 "Email: " + email + "\n" +
                 "Empresa: " + company + "\n" +
                 "Sector: " + sector + "\n" +
                 "Caso de Uso: " + useCase + "\n\n" +
                 "--- EVIDENCIA DE CONSENTIMIENTO RGPD ---\n" +
                 "Estado: Aceptado y verificado en servidor\n" +
                 "Versión texto: " + consentVersion + "\n" +
                 "URL: " + pageUrl + "\n" +
                 "IP / Origen: " + clientIp + "\n";
      MailApp.sendEmail("info@valnatir.com", subject, body);
    } catch (mailErr) {
      Logger.log("Error enviando alerta por email: " + mailErr);
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        leadId: leadId,
        timestamp: timestampIso,
        message: "Solicitud registrada y consentimiento archivado conforme a RGPD."
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (ex) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: ex.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
