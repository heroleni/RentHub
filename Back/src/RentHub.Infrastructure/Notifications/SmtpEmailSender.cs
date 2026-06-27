using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace RentHub.Infrastructure.Notifications;

/// <summary>Abstracción para enviar correos. Permite testear sin tocar la red.</summary>
public interface IEmailSender
{
    Task SendAsync(string toEmail, string toName, string subject, string body, CancellationToken ct = default);
}

/// <summary>
/// Implementación real de envío de correo vía SMTP usando MailKit.
/// MailKit es la librería recomendada por Microsoft (System.Net.Mail.SmtpClient
/// está marcado como obsoleto para nuevo desarrollo).
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string toName, string subject, string body, CancellationToken ct = default)
    {
        if (!_options.IsConfigured)
        {
            // Modo desarrollo: SMTP deshabilitado. No es un error; simplemente
            // no se manda correo real (la notificación igual se persiste en BD).
            _logger.LogInformation(
                "[SMTP deshabilitado] Correo NO enviado a {Email}. Asunto: {Subject}",
                toEmail, subject);
            return;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder
        {
            TextBody = body,
            HtmlBody = $"<p>{System.Net.WebUtility.HtmlEncode(body)}</p>"
        }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            // STARTTLS para 587, SSL implícito para 465.
            var secureOption = _options.UseSsl
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await client.ConnectAsync(_options.Host, _options.Port, secureOption, ct);

            if (!string.IsNullOrWhiteSpace(_options.User))
                await client.AuthenticateAsync(_options.User, _options.Password, ct);

            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Correo enviado a {Email}. Asunto: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            // No tumbamos la operación de negocio (reserva, KYC, etc.) porque
            // el correo falle. Lo registramos y seguimos.
            _logger.LogError(ex, "Fallo enviando correo a {Email}. Asunto: {Subject}", toEmail, subject);
        }
    }
}
