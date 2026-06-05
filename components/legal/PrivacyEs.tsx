import { LegalShell } from "./LegalShell";

// Spanish (Argentina) — compliant con Ley 25.326 de Protección de Datos
// Personales + alineado con GDPR para clientes europeos eventuales.
// Cualquier cambio sustantivo (datos nuevos, terceros nuevos, jurisdicción)
// debe versionarse: cambiar "updated" + agregar nota al final.
export function PrivacyEs() {
  return (
    <LegalShell title="Política de Privacidad" updated="Última actualización: 4 de junio de 2026">
      <p>
        Esta política describe cómo <strong>Wapsell</strong> (en adelante,
        &ldquo;nosotros&rdquo; o &ldquo;el Servicio&rdquo;) recolecta, usa y
        protege la información personal de quienes utilizan nuestro sitio web
        (wapsell.com) y los servicios que ofrecemos.
      </p>

      <p>
        Al usar Wapsell aceptás los términos descritos en esta política. Si no
        estás de acuerdo, te pedimos que dejes de usar el Servicio.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de tus datos personales es{" "}
        <strong>Fulvio Monfasani</strong>, monotributista CUIT a disposición a
        requerimiento, con domicilio en la Provincia de Córdoba, Argentina.
        Podés contactarnos en{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>.
      </p>

      <h2>2. Datos que recolectamos</h2>
      <h3>Datos que vos nos das</h3>
      <ul>
        <li>
          Nombre, email y teléfono cuando completás un formulario o nos
          escribís por WhatsApp.
        </li>
        <li>
          Datos de tu negocio (rubro, sitio, equipo) cuando contratás el
          Servicio.
        </li>
        <li>
          Datos de facturación (CUIT, razón social, domicilio fiscal) si
          adquirís un plan pago.
        </li>
      </ul>

      <h3>Datos que se generan automáticamente</h3>
      <ul>
        <li>
          Logs de uso: dirección IP, tipo de navegador, páginas visitadas,
          fecha y hora.
        </li>
        <li>
          Cookies estrictamente necesarias para que el sitio funcione (por
          ejemplo, la preferencia de idioma).
        </li>
        <li>
          Métricas agregadas y anonimizadas de uso del producto (sin
          identificarte personalmente).
        </li>
      </ul>

      <h3>Datos de tus clientes (cuando usás Wapsell para venderle a ellos)</h3>
      <p>
        Cuando contratás Wapsell para responder consultas de tus clientes
        finales por WhatsApp, somos un <strong>encargado del tratamiento</strong>{" "}
        de los datos que esos clientes te envían. Procesamos esos datos
        únicamente para entregarte el Servicio. Vos sos el responsable de
        decidir qué hacer con esos datos y de cumplir tus propias obligaciones
        legales con tus clientes finales.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Brindarte el Servicio que contrataste.</li>
        <li>Comunicarnos con vos sobre tu cuenta, soporte y actualizaciones.</li>
        <li>Facturarte y cumplir con obligaciones tributarias.</li>
        <li>
          Mejorar el producto (con datos agregados y anonimizados, nunca con
          tus mensajes individuales sin tu consentimiento expreso).
        </li>
        <li>
          Cumplir requerimientos legales o judiciales cuando corresponda.
        </li>
      </ul>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>
        No vendemos tus datos. Los compartimos solamente con proveedores que
        necesitamos para operar el Servicio, cada uno bajo acuerdos de
        confidencialidad:
      </p>
      <ul>
        <li>
          <strong>Meta Platforms Ireland Ltd.</strong> (WhatsApp Business
          Platform) — necesario para enviar y recibir mensajes.
        </li>
        <li>
          <strong>OpenRouter, Inc.</strong> y/o sus proveedores aguas arriba
          (OpenAI, Anthropic, etc.) — para generar las respuestas del agente.
        </li>
        <li>
          <strong>Hetzner Online GmbH</strong> — alojamiento de la
          infraestructura.
        </li>
        <li>
          <strong>Mercado Pago Argentina</strong> y/o <strong>Stripe</strong> —
          procesamiento de pagos.
        </li>
        <li>
          Autoridades públicas si lo exige la ley, una orden judicial o un
          requerimiento fiscal.
        </li>
      </ul>

      <h2>5. Transferencias internacionales</h2>
      <p>
        Algunos de los proveedores indicados arriba operan fuera de la
        Argentina. En esos casos, exigimos garantías contractuales adecuadas y
        nos limitamos a proveedores reconocidos por la Agencia de Acceso a la
        Información Pública o equivalentes internacionales.
      </p>

      <h2>6. Por cuánto tiempo guardamos tus datos</h2>
      <ul>
        <li>
          <strong>Datos de cuenta:</strong> mientras tengas el Servicio activo
          más 5 años por obligaciones fiscales.
        </li>
        <li>
          <strong>Conversaciones de WhatsApp procesadas para vos:</strong>{" "}
          mientras dure tu suscripción. Podés pedir su eliminación o exportación
          en cualquier momento.
        </li>
        <li>
          <strong>Logs técnicos:</strong> hasta 12 meses, después se borran
          automáticamente.
        </li>
      </ul>

      <h2>7. Tus derechos</h2>
      <p>
        Según la Ley 25.326 de Protección de Datos Personales, tenés derecho a:
      </p>
      <ul>
        <li>Acceder a los datos que tenemos sobre vos.</li>
        <li>Pedir que los rectifiquemos si están incorrectos.</li>
        <li>Pedir que los borremos cuando ya no sean necesarios.</li>
        <li>Oponerte a tratamientos específicos.</li>
        <li>
          Solicitar la portabilidad de tus datos en un formato estándar
          legible por máquina.
        </li>
      </ul>
      <p>
        Para ejercer cualquiera de estos derechos escribinos a{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>. Te respondemos
        dentro de los 10 días corridos.
      </p>
      <p>
        También podés presentar reclamos ante la{" "}
        <a
          href="https://www.argentina.gob.ar/aaip"
          target="_blank"
          rel="noopener noreferrer"
        >
          Agencia de Acceso a la Información Pública
        </a>{" "}
        si entendés que tus derechos no fueron respetados.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables para proteger tus
        datos: transmisión vía HTTPS, encriptación de tokens sensibles en
        reposo, control de acceso por perfil y backups diarios. Ningún sistema
        es 100% seguro: si detectamos una violación de datos que pueda
        afectarte, te notificaremos dentro de las 72 horas y reportaremos a la
        autoridad competente cuando corresponda.
      </p>

      <h2>9. Menores</h2>
      <p>
        Wapsell es un servicio B2B. No está dirigido a menores de 18 años. Si
        sos menor de edad, por favor no nos envíes información personal.
      </p>

      <h2>10. Cookies</h2>
      <p>
        Usamos solo cookies estrictamente necesarias (preferencia de idioma,
        sesión). No usamos cookies de marketing ni perfilado por terceros sin
        tu consentimiento. Podés desactivarlas desde tu navegador, aunque eso
        puede afectar el funcionamiento del sitio.
      </p>

      <h2>11. Cambios a esta política</h2>
      <p>
        Si modificamos esta política, vamos a publicar la nueva versión acá con
        la fecha actualizada. Si los cambios son sustantivos, te avisamos por
        email o WhatsApp antes de que entren en vigencia.
      </p>

      <h2>12. Contacto</h2>
      <p>
        Cualquier consulta sobre esta política, escribinos a{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>.
      </p>
    </LegalShell>
  );
}
