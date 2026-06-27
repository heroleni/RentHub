using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Domain.Enums;

namespace RentHub.Application.Kyc;

public class KycService
{
    private readonly IKycService _ai;
    private readonly IKycRepository _verifications;
    private readonly IUserRepository _users;
    private readonly INotificationService _notifications;

    public KycService(
        IKycService ai,
        IKycRepository verifications,
        IUserRepository users,
        INotificationService notifications)
    {
        _ai = ai;
        _verifications = verifications;
        _users = users;
        _notifications = notifications;
    }

    public async Task<KycResultDto> SubmitAsync(
        Guid userId,
        Stream frontImage,
        Stream backImage,
        CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User not found.");

        user.SetKycStatus(KycStatus.Processing);

        var result = await _ai.AnalyzeDocumentAsync(frontImage, backImage, ct);

        if (result.Status == "approved")
        {
            user.SetKycStatus(KycStatus.Approved);

            var verification = KycVerification.Approved(
                userId,
                result.Names ?? string.Empty,
                result.LastNames ?? string.Empty,
                result.DocumentNumber ?? string.Empty,
                result.BirthDate ?? default);

            await _verifications.AddAsync(verification, ct);

            await _notifications.NotifyAsync(
                userId,
                "Identidad verificada",
                "¡Tu identidad fue verificada con éxito! Ya puedes confirmar reservas en RentHub.",
                ct);
        }
        else
        {
            user.SetKycStatus(KycStatus.Rejected);

            var verification = KycVerification.Rejected(userId, result.Reason ?? "Verification failed.");
            await _verifications.AddAsync(verification, ct);

            await _notifications.NotifyAsync(
                userId,
                "Verificación rechazada",
                "No pudimos verificar tu identidad. Por favor intenta de nuevo con una foto más clara de tu documento.",
                ct);
        }

        return result;
    }
}
