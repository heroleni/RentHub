using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RentHub.Application.Common.Interfaces;
using RentHub.Infrastructure.Persistence;

namespace RentHub.Infrastructure.Notifications;

public class InAppNotification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public bool Read { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Notifica al usuario por dos canales:
///   1. Persiste una notificación in-app en la base de datos.
///   2. Envía un correo electrónico real vía SMTP (IEmailSender).
/// El envío de correo es best-effort: si falla no rompe la operación de negocio.
/// </summary>
public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;
    private readonly IEmailSender _email;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(AppDbContext db, IEmailSender email, ILogger<NotificationService> logger)
    {
        _db = db;
        _email = email;
        _logger = logger;
    }

    public async Task NotifyAsync(Guid userId, string subject, string message, CancellationToken ct = default)
    {
        // 1. Notificación in-app
        var notification = new InAppNotification
        {
            UserId = userId,
            Subject = subject,
            Message = message
        };

        await _db.Set<InAppNotification>().AddAsync(notification, ct);
        await _db.SaveChangesAsync(ct);

        // 2. Correo real: necesitamos el email del destinatario.
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null)
        {
            _logger.LogWarning("No se pudo enviar correo: usuario {UserId} no encontrado.", userId);
            return;
        }

        await _email.SendAsync(user.Email, user.FullName, subject, message, ct);
    }
}
