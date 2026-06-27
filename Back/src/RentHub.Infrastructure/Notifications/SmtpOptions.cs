namespace RentHub.Infrastructure.Notifications;

/// <summary>
/// Configuración del servidor SMTP. Se enlaza desde la sección "Smtp" de
/// appsettings.json / variables de entorno (Smtp__Host, Smtp__Port, ...).
/// </summary>
public class SmtpOptions
{
    public const string SectionName = "Smtp";

    /// <summary>Host del servidor SMTP. Ej: smtp.gmail.com, sandbox.smtp.mailtrap.io</summary>
    public string Host { get; set; } = "";

    /// <summary>Puerto SMTP. 587 = STARTTLS (recomendado), 465 = SSL implícito, 2525 = Mailtrap.</summary>
    public int Port { get; set; } = 587;

    /// <summary>Usuario de autenticación SMTP.</summary>
    public string User { get; set; } = "";

    /// <summary>Contraseña o App Password del servidor SMTP.</summary>
    public string Password { get; set; } = "";

    /// <summary>Dirección que aparece como remitente.</summary>
    public string FromEmail { get; set; } = "no-reply@renthub.local";

    /// <summary>Nombre visible del remitente.</summary>
    public string FromName { get; set; } = "RentHub";

    /// <summary>
    /// Si es true, usa SSL implícito (puerto 465). Si es false, usa STARTTLS (puerto 587).
    /// </summary>
    public bool UseSsl { get; set; } = false;

    /// <summary>
    /// Interruptor maestro. Si está en false, NO se intenta enviar correo real
    /// (útil en desarrollo/CI: la notificación se guarda en BD pero el email se omite).
    /// </summary>
    public bool Enabled { get; set; } = false;

    public bool IsConfigured =>
        Enabled && !string.IsNullOrWhiteSpace(Host) && !string.IsNullOrWhiteSpace(FromEmail);
}
