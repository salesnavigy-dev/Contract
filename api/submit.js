const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function fmt(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return new Date(y, m - 1, day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function sigBlock(label, name, sig, fecha) {
  const img = sig && sig.length > 100
    ? `<img src="${sig}" style="height:56px;display:block;border:1px solid #E2E6EF;border-radius:6px;background:#fff;margin-top:6px;" />`
    : `<div style="height:56px;display:flex;align-items:center;justify-content:center;border:1px dashed #E2E6EF;border-radius:6px;margin-top:6px;font-size:11px;color:#7C869A;">Sin firma</div>`;
  return `
    <td style="width:33%;padding:0 6px;vertical-align:top;">
      <div style="background:#F5F6F9;border:1px solid #E2E6EF;border-radius:8px;padding:12px;">
        <div style="font-size:10px;font-weight:600;color:#1769C2;text-transform:uppercase;letter-spacing:0.07em;">${label}</div>
        <div style="font-size:12px;font-weight:700;color:#0D0F14;margin-top:3px;line-height:1.3;">${name || '—'}</div>
        ${img}
        <div style="margin-top:8px;font-size:11px;color:#7C869A;">Fecha: ${fmt(fecha)}</div>
      </div>
    </td>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { clienteName, fechaTelmo, fechaManuel, fechaCliente, sigTelmo, sigManuel, sigCliente } = req.body;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#F5F6F9;">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E6EF;">

  <div style="background:#1769C2;padding:20px 28px;">
    <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Navigy</span>
    <span style="float:right;color:rgba(255,255,255,0.75);font-size:12px;line-height:28px;">Contrato firmado</span>
  </div>

  <div style="padding:28px;">
    <h2 style="margin:0 0 4px;font-size:17px;color:#0D0F14;font-weight:700;">Acuerdo de Prestación de Servicios</h2>
    <p style="margin:0 0 20px;color:#7C869A;font-size:12px;">Recibido el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

    <div style="background:#E8F1FB;border-left:3px solid #1769C2;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
      <div style="font-size:10px;font-weight:600;color:#1769C2;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:3px;">Cliente que firma</div>
      <div style="font-size:15px;font-weight:700;color:#0D0F14;">${clienteName || '(sin nombre)'}</div>
    </div>

    <div style="font-size:10px;font-weight:600;color:#1769C2;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:10px;">Firmas</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 -6px;">
      <tr>
        ${sigBlock('Prestador', 'Telmo Gutiérrez', sigTelmo, fechaTelmo)}
        ${sigBlock('Prestador', 'Manuel Sánchez de la Madrid', sigManuel, fechaManuel)}
        ${sigBlock('Cliente', clienteName, sigCliente, fechaCliente)}
      </tr>
    </table>
  </div>

  <div style="padding:14px 28px;border-top:1px solid #E2E6EF;">
    <span style="font-size:11px;color:#7C869A;">Documento confidencial · Acuerdo mercantil entre las partes</span>
    <span style="float:right;font-size:12px;font-weight:700;color:#1769C2;">Navigy</span>
  </div>

</div>
</body></html>`;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'salesnavigy@gmail.com',
      subject: `Contrato firmado — ${clienteName || 'Cliente'}`,
      html,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el email' });
  }
};
